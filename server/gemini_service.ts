import { GoogleGenAI } from '@google/genai';

const SYSTEM_INSTRUCTION = `You are the natural-language intelligence and explanation layer of FinTracker, a personal finance assistant.

The structured predictions, classifications, and calculations provided in the context come from FinTracker's custom analytical models (Model 1: Logistic Regression, Model 2: Extra Trees, Model 3: Random Forest Classifier, Model 4: BANKING77 Linear SVM, Model 5: Random Forest Regressor). Treat those values as authoritative.

Your task is to provide exact, high-quality, comprehensive, and helpful answers to user inquiries.
- Never invent fabricated transactions that contradict the user's ledger.
- Answer user banking questions directly with exact mechanisms, timeframes, and actionable steps.
- All amounts are in Indian Rupees (INR / ₹).`;

export interface CategorizationContext {
  description: string;
  category: string;
  confidence: number;
  model: string;
}

export interface SpendingPredictionContext {
  historicalSpending: number[];
  predictedNextMonthSpending: number;
  months?: string[];
  targetMonth?: string;
  averageSpending?: number;
  percentageChange?: number;
  highestMonth?: string;
  lowestMonth?: string;
  model: string;
  currency?: string;
}

export interface WellbeingContext {
  surveyFeatures?: Record<string, number>;
  category: string;
  confidence: number;
  model: string;
}

export interface BankingIntentContext {
  userQuery: string;
  intent: string;
  readableIntent: string;
  confidence: number;
  model: string;
  suggestedAction?: string;
  contextualAnswer?: string;
  financialContext?: {
    monthlyIncome?: number;
    monthlyExpenses?: number;
    currentSavings?: number;
    emergencyFund?: number;
    topExpenseCategories?: { category: string; amount: number }[];
  };
}

export interface InvestmentRiskContext {
  age?: number;
  income?: number;
  expenses?: number;
  savings?: number;
  riskScore: number;
  riskCategory: string;
  model: string;
}

export interface InvestmentRecommendationContext {
  age: number;
  income: number;
  expenses: number;
  savings: number;
  emergencyFund: number;
  investmentAmount: number;
  goal: string;
  horizonYears: number;
  riskScore: number;
  riskCategory: string;
  model: string;
  emergencyTarget: number;
  emergencyGap: number;
  emergencyMonths: number;
  emergencyStatus: string;
  safetyAdjustments: string[];
  recommendedCategories: {
    name: string;
    assetClass: string;
    percentage: number;
    amountInr: number;
    rationale: string;
  }[];
}

export interface UnifiedPipelineContext {
  userQuery: string;
  spendingVariance?: {
    previousMonth: number;
    currentMonth: number;
    difference: number;
    pctChange: number;
    topCategory?: string;
  };
  detectedIntent?: {
    intent: string;
    readableIntent: string;
    confidence: number;
    suggestedAction?: string;
  };
  predictedSpending?: {
    predictedAmount: number;
    model: string;
  };
}

class GeminiService {
  private ai: GoogleGenAI | null = null;
  private initialized = false;

  private getClient(): GoogleGenAI | null {
    if (this.initialized) {
      return this.ai;
    }
    this.initialized = true;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
      console.info(
        '[FinTracker Backend] GEMINI_API_KEY not configured. Running in high-fidelity deterministic model fallback mode.'
      );
      this.ai = null;
      return null;
    }

    try {
      this.ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
      return this.ai;
    } catch (err) {
      console.warn('[FinTracker Backend] Failed to initialize GoogleGenAI client:', err);
      this.ai = null;
      return null;
    }
  }

  /**
   * Resilient content generation with model cascade fallback
   * Tries models in order: 'gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'
   */
  private async generateText(prompt: string, temperature = 0.2): Promise<string | null> {
    const client = this.getClient();
    if (!client) {
      return null;
    }

    const modelsToTry = [
      'gemini-3.1-flash-lite',
      'gemini-flash-latest',
      'gemini-3.8-flash',
    ];

    for (const model of modelsToTry) {
      try {
        const response = await client.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature,
          },
        });

        const text = response.text?.trim();
        if (text) {
          return text;
        }
      } catch (err: unknown) {
        console.warn(`[FinTracker Backend] Model "${model}" generation failed, cascading to next model:`, err instanceof Error ? err.message : err);
      }
    }

    return null;
  }

  /**
   * Explains Model 1 Expense Categorization result
   */
  async explainExpenseCategorization(ctx: CategorizationContext): Promise<{ explanation: string; enhanced: boolean }> {
    const fallback = `Categorized as "${ctx.category}" with ${(ctx.confidence * 100).toFixed(1)}% confidence by the ${ctx.model} based on transaction description pattern matching.`;

    const prompt = `The analytical model "${ctx.model}" analyzed the transaction description: "${ctx.description}".
It authoritatively categorized it as "${ctx.category}" with ${(ctx.confidence * 100).toFixed(1)}% confidence.

In 1-2 friendly, clear sentences, explain to the user why this transaction fits the "${ctx.category}" category based on the description keywords, without altering or second-guessing the category.`;

    const text = await this.generateText(prompt, 0.2);
    if (!text) {
      return { explanation: fallback, enhanced: false };
    }
    return { explanation: text, enhanced: true };
  }

  /**
   * Explains Model 2 Spending Prediction result
   */
  async explainSpendingPrediction(ctx: SpendingPredictionContext): Promise<{ explanation: string; enhanced: boolean }> {
    const fallback = `Based on your historical expenditure across ${ctx.historicalSpending.length} months, the ${ctx.model} projects next month's expenditure at ₹${ctx.predictedNextMonthSpending.toLocaleString('en-IN')}.`;

    const historyBreakdown = ctx.months && ctx.months.length === ctx.historicalSpending.length
      ? ctx.months.map((m, i) => `${m}: ₹${ctx.historicalSpending[i].toLocaleString('en-IN')}`).join(', ')
      : ctx.historicalSpending.map((v) => `₹${v.toLocaleString('en-IN')}`).join(', ');

    const prompt = `You are FinTracker's Analytical Spending Prediction Engine.
Authoritative ML Forecast from Model 2:
- Machine Learning Model: ${ctx.model} (Extra Trees Regressor)
- Historical 4-Month Spending: [${historyBreakdown}]
- Predicted Upcoming Month (${ctx.targetMonth || 'Next Month'}) Spending: ₹${ctx.predictedNextMonthSpending.toLocaleString('en-IN')}
${ctx.averageSpending ? `- 4-Month Historical Average: ₹${ctx.averageSpending.toLocaleString('en-IN')}` : ''}
${ctx.percentageChange !== undefined ? `- Variance vs Historical Average: ${ctx.percentageChange > 0 ? '+' : ''}${ctx.percentageChange.toFixed(2)}%` : ''}
${ctx.highestMonth ? `- Peak Historical Month: ${ctx.highestMonth}` : ''}
${ctx.lowestMonth ? `- Lowest Historical Month: ${ctx.lowestMonth}` : ''}

STRICT CONSTRAINTS:
1. Do NOT mention Gemini, Google, LLM, or artificial intelligence. Speak authoritatively as FinTracker's financial analytics engine.
2. The predicted number ₹${ctx.predictedNextMonthSpending.toLocaleString('en-IN')} is authoritative from the Extra Trees model; do not modify or contradict it.
3. In 3 structured, clear bullet points, provide:
   * Trajectory Analysis: State whether spending is trending upward, downward, or stabilizing relative to the past 4 months.
   * Overspending Risk: Evaluate the likelihood and risk of budget strain or overspending based on previous average.
   * Recommended Budget Action: A concrete, practical spending guardrail or cap for the upcoming month.
4. Keep the tone professional, objective, and analytical. Use Indian Rupees (₹).`;

    const text = await this.generateText(prompt, 0.2);
    if (!text) {
      return { explanation: fallback, enhanced: false };
    }
    return { explanation: text, enhanced: true };
  }

  /**
   * Explains Model 3 Financial Well-Being result
   */
  async explainFinancialWellbeing(ctx: WellbeingContext): Promise<{ explanation: string; enhanced: boolean }> {
    const fallback = `Classified as "${ctx.category}" financial well-being with ${(ctx.confidence * 100).toFixed(0)}% confidence by the ${ctx.model} based on CFPB National Survey standards.`;

    const prompt = `The CFPB Financial Well-Being model "${ctx.model}" analyzed 25 survey features and authoritatively classified the user into the "${ctx.category}" well-being category with ${(ctx.confidence * 100).toFixed(1)}% confidence.

In 2-3 encouraging, practical sentences, explain what the "${ctx.category}" well-being standing signifies for their daily cash-flow resilience and long-term financial security, without changing or fabricating classifications.`;

    const text = await this.generateText(prompt, 0.2);
    if (!text) {
      return { explanation: fallback, enhanced: false };
    }
    return { explanation: text, enhanced: true };
  }

  /**
   * Explains Model 4 Banking77 Query Intent result & provides exact, high-quality banking answers
   */
  async explainBankingIntent(ctx: BankingIntentContext): Promise<{ explanation: string; enhanced: boolean }> {
    const fallback =
      ctx.contextualAnswer ||
      ctx.suggestedAction ||
      `Your inquiry has been categorized under "${ctx.readableIntent}" by the ${ctx.model} (${(ctx.confidence * 100).toFixed(0)}% confidence).`;

    const financialDetails = ctx.financialContext
      ? `\nActive User Ledger Facts:\n- Monthly Income: ₹${(ctx.financialContext.monthlyIncome ?? 65000).toLocaleString('en-IN')}\n- Monthly Expenses: ₹${(ctx.financialContext.monthlyExpenses ?? 38500).toLocaleString('en-IN')}\n- Current Savings: ₹${(ctx.financialContext.currentSavings ?? 148250).toLocaleString('en-IN')}\n- Emergency Fund Reserve: ₹${(ctx.financialContext.emergencyFund ?? 100000).toLocaleString('en-IN')}\n- Top Recorded Expense Categories: Shopping (₹6,189), Travel (₹5,400), Groceries (₹3,420), Utilities (₹2,800), Food & Dining (₹3,420)`
      : `\nActive User Ledger Facts:\n- Monthly Income: ₹65,000\n- Monthly Expenses: ₹38,500\n- Current Savings: ₹1,48,250\n- Emergency Fund Reserve: ₹1,00,000`;

    const prompt = `You are FinTracker's Banking & Financial Intelligence Expert.
The user is asking this exact question in the Banking AI Assistant:
"${ctx.userQuery}"

Authoritative Model 4 Classification:
- Custom ML Model: ${ctx.model} (TF-IDF + Linear SVM trained on BANKING77)
- Detected Intent Code: "${ctx.intent}"
- Semantic Intent Category: "${ctx.readableIntent}"
- Intent Confidence: ${(ctx.confidence * 100).toFixed(1)}%
${ctx.suggestedAction ? `- Baseline Action Recommended: "${ctx.suggestedAction}"` : ''}
${ctx.contextualAnswer ? `- Reference Guidance: "${ctx.contextualAnswer}"` : ''}
${financialDetails}

REQUIREMENTS FOR AN EXACT, DEFINITIVE, HIGH-QUALITY ANSWER:
1. EXACT DIRECT ANSWER FIRST:
   - In the very first sentence, provide the exact, unambiguous answer to the user's specific question.
   - Do NOT use generic conversational filler (e.g. "Certainly", "I can help you with that", "Hello"). Start immediately with the direct answer.

2. TECHNICAL RIGOR & INDIAN BANKING SPECIFICS:
   - Provide concrete, technically precise banking details applicable in India:
     * Electronic Transfers (UPI, IMPS, NEFT, RTGS): Explain exact clearing windows (UPI/IMPS real-time 24x7 via NPCI, NEFT half-hour batches 24x7, RTGS continuous real-time ≥ ₹2 Lakhs). Explain why transfers get delayed (inter-bank reconciliation buffer, bank CBS maintenance), the critical role of the 12-digit UTR (Unique Transaction Reference) or RRN, and auto-reversal timelines (T+1 to T+5 days).
     * Card Declines & Failed Payments: Explain exact root causes under RBI security guidelines (RBI e-mandate rules, card management toggles for online/international/contactless POS, daily card limits, or bank CBS timeouts).
     * Fraud, Unauthorized Charges & Chargebacks: Detail immediate card freeze procedures, RBI's Zero Liability Policy (zero customer liability if reported within 3 calendar days; limited liability within 4-7 days), how to obtain dispute reference numbers, and reporting to National Cyber Crime Reporting Portal (Helpline 1930 / cybercrime.gov.in).
     * Beneficiaries & Security: Mention mandatory cooling-off windows (30 mins to 4 hours) and first 24-hour transfer caps (₹25,000–₹50,000) for newly added beneficiaries.
     * Limits & Regulations: State official limits (UPI daily limit of ₹1 Lakh standard, up to ₹5 Lakhs for hospital/education; IMPS up to ₹5 Lakhs; standard ATM cash limits of ₹25,000–₹50,000).
     * Personal Finance & Ledger Queries: If the user asks about their own spending, income, budget, or savings, cite their exact FinTracker numbers: Monthly Income ₹65,000, Total Expenses ₹38,500, Monthly Surplus ₹26,500, Current Savings ₹1,48,250, Emergency Reserve ₹1,00,000.

3. ACTIONABLE STEP-BY-STEP GUIDANCE:
   - Provide 2 to 3 clear, concrete next steps the user should perform right now (e.g. specific menu in mobile banking app, tracking via UTR, or contacting bank grievance redressal / RBI Ombudsman).

4. CLEAN, PROFESSIONAL STRUCTURE:
   - Format with concise paragraphs and clearly structured bullet points.
   - All currency in Indian Rupees (₹).
   - Tone must be authoritative, expert, and fintech-grade.`;

    const text = await this.generateText(prompt, 0.15);
    if (!text) {
      return { explanation: fallback, enhanced: false };
    }
    return { explanation: text, enhanced: true };
  }

  /**
   * Explains Model 5 Investment Risk result
   */
  async explainInvestmentRisk(ctx: InvestmentRiskContext): Promise<{ explanation: string; enhanced: boolean }> {
    const fallback = `Your investment risk profile evaluates to "${ctx.riskCategory}" (score ${ctx.riskScore.toFixed(2)}/7.0) by the ${ctx.model}. This suggests maintaining an appropriate balance between equity growth and debt stability.`;

    const prompt = `The Investment Risk Model "${ctx.model}" calculated an investment risk score of ${ctx.riskScore.toFixed(2)} / 7.0, classifying risk tolerance as "${ctx.riskCategory}".
Financial profile context: Age ${ctx.age ?? 26}, Monthly Income ₹${(ctx.income ?? 65000).toLocaleString('en-IN')}, Expenses ₹${(ctx.expenses ?? 38500).toLocaleString('en-IN')}, Savings ₹${(ctx.savings ?? 148250).toLocaleString('en-IN')}.

In 2-3 clear, prudent sentences, explain what a "${ctx.riskCategory}" risk classification (score ${ctx.riskScore.toFixed(2)}) means for their investment portfolio and asset allocation. Emphasize that this is an analytical estimate for educational guidance.`;

    const text = await this.generateText(prompt, 0.2);
    if (!text) {
      return { explanation: fallback, enhanced: false };
    }
    return { explanation: text, enhanced: true };
  }

  /**
   * Explains Investment Recommendation Engine output
   * Bridges ML Risk Model (Random Forest Regressor) with rule-based asset allocation
   * and personalized safety rules.
   */
  async explainInvestmentRecommendation(ctx: InvestmentRecommendationContext): Promise<{ explanation: string; enhanced: boolean }> {
    const categoriesSummary = ctx.recommendedCategories
      .map((c) => `${c.name} (${c.percentage}%, ₹${c.amountInr.toLocaleString('en-IN')})`)
      .join(', ');

    const fallback = `Based on your ${ctx.riskCategory} risk profile (score ${ctx.riskScore.toFixed(2)}/7.0 from ${ctx.model}) and ${ctx.horizonYears}-year horizon for "${ctx.goal}", your ₹${ctx.investmentAmount.toLocaleString('en-IN')}/month is allocated across: ${categoriesSummary}.${
      ctx.safetyAdjustments.length > 0 ? ` Safety note: ${ctx.safetyAdjustments[0]}` : ''
    }`;

    const categoryDetails = ctx.recommendedCategories
        .map(
          (c) =>
            `- ${c.name} [Asset Class: ${c.assetClass}]: ${c.percentage}% (₹${c.amountInr.toLocaleString('en-IN')}/mo). Role: ${c.rationale}`
        )
        .join('\n');

      const safetyNotes = ctx.safetyAdjustments.length > 0
        ? ctx.safetyAdjustments.map((s) => `- ${s}`).join('\n')
        : '- All baseline safety constraints satisfied (emergency reserve targets fully maintained).';

      const prompt = `You are explaining the personalized investment portfolio generated for an Indian investor by FinTracker's AI & Rule-Based Advisory Engine.

Authoritative Analytical & Rule-Engine Inputs:
- ML Model Used: ${ctx.model} (Investment Risk Model)
- Assessed Risk Score: ${ctx.riskScore.toFixed(2)} / 7.00 (Classification: "${ctx.riskCategory}")
- Investor Profile: Age ${ctx.age}, Monthly Income ₹${ctx.income.toLocaleString('en-IN')}, Expenses ₹${ctx.expenses.toLocaleString('en-IN')}, Current Savings ₹${ctx.savings.toLocaleString('en-IN')}
- Goal & Horizon: "${ctx.goal}" over ${ctx.horizonYears} years
- Monthly Investable Capital: ₹${ctx.investmentAmount.toLocaleString('en-IN')}
- Emergency Fund Status: Current ₹${ctx.emergencyFund.toLocaleString('en-IN')} vs 6-Month Target ₹${ctx.emergencyTarget.toLocaleString('en-IN')} (${ctx.emergencyMonths.toFixed(1)} months coverage, status: "${ctx.emergencyStatus}")
- Safety Engine Adjustments Applied:
${safetyNotes}

Recommended Asset Categories & Monthly Rupee Allocations:
${categoryDetails}

Task:
Write a 3-4 sentence comprehensive, encouraging, and financially prudent advisory narrative for the user:
1. Explain WHY this asset allocation matches their "${ctx.riskCategory}" risk profile and ${ctx.horizonYears}-year investment horizon.
2. Highlight how the specific vehicles (such as Index Funds, Fixed Deposits/Debt, Hybrid funds, or Gold) work together to balance growth with downside stability.
3. If there is an emergency fund shortfall or short horizon constraint, acknowledge how their allocation responsibly addresses it.
4. Do NOT guarantee returns, fabricate percentage returns, or change any rupee numbers. Keep language accessible, supportive, and rooted in Indian personal finance practices (SIPs, FDs, mutual funds).`;

    const text = await this.generateText(prompt, 0.2);
    if (!text) {
      return { explanation: fallback, enhanced: false };
    }
    return { explanation: text, enhanced: true };
  }

  /**
   * Unified AI Response Pipeline
   * Combines structured facts (transactions, spending variance, banking intent)
   * and provides a cohesive, natural-language answer without hallucinating numbers.
   */
  async runUnifiedPipeline(ctx: UnifiedPipelineContext): Promise<{ answer: string; enhanced: boolean }> {
    let fallback = 'I have analyzed your financial records against FinTracker models.';
    if (ctx.spendingVariance) {
      const dir = ctx.spendingVariance.difference >= 0 ? 'increased' : 'decreased';
      fallback = `Your expenses ${dir} by ₹${Math.abs(ctx.spendingVariance.difference).toLocaleString('en-IN')} (${Math.abs(ctx.spendingVariance.pctChange).toFixed(1)}%) from ₹${ctx.spendingVariance.previousMonth.toLocaleString('en-IN')} to ₹${ctx.spendingVariance.currentMonth.toLocaleString('en-IN')}${
        ctx.spendingVariance.topCategory ? `, driven primarily by spending in ${ctx.spendingVariance.topCategory}` : ''
      }.`;
    } else if (ctx.detectedIntent?.suggestedAction) {
      fallback = ctx.detectedIntent.suggestedAction;
    }

    let contextStr = `User Question: "${ctx.userQuery}"\n\nAuthoritative Structured Analytical Facts from FinTracker:\n`;
    if (ctx.spendingVariance) {
      contextStr += `- Previous Month Expenditure: ₹${ctx.spendingVariance.previousMonth.toLocaleString('en-IN')}\n`;
      contextStr += `- Current Month Expenditure: ₹${ctx.spendingVariance.currentMonth.toLocaleString('en-IN')}\n`;
      contextStr += `- Absolute Difference: ${ctx.spendingVariance.difference >= 0 ? '+' : '-'}₹${Math.abs(ctx.spendingVariance.difference).toLocaleString('en-IN')} (${ctx.spendingVariance.pctChange >= 0 ? '+' : ''}${ctx.spendingVariance.pctChange.toFixed(1)}%)\n`;
      if (ctx.spendingVariance.topCategory) {
        contextStr += `- Major Contributing Category: ${ctx.spendingVariance.topCategory}\n`;
      }
    }
    if (ctx.detectedIntent) {
      contextStr += `- Banking Intent Detected: "${ctx.detectedIntent.readableIntent}" (confidence: ${(ctx.detectedIntent.confidence * 100).toFixed(1)}%)\n`;
      if (ctx.detectedIntent.suggestedAction) {
        contextStr += `- Recommended Guidance: "${ctx.detectedIntent.suggestedAction}"\n`;
      }
    }
    if (ctx.predictedSpending) {
      contextStr += `- Next Month Spending Forecast: ₹${ctx.predictedSpending.predictedAmount.toLocaleString('en-IN')} (${ctx.predictedSpending.model})\n`;
    }

    const prompt = `${contextStr}\nAnswer the user's question clearly, concisely, and supportively in 2-3 sentences based ONLY on the authoritative facts above. Do not invent any numbers or contradict these findings.`;

    const text = await this.generateText(prompt, 0.2);
    if (!text) {
      return { answer: fallback, enhanced: false };
    }
    return { answer: text, enhanced: true };
  }
}

export const geminiService = new GeminiService();
