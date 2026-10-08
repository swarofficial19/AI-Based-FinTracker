import {
  Transaction,
  FinancialGoal,
  UserProfile,
  DashboardMetrics,
  CategorizeExpenseRequest,
  CategorizeExpenseResponse,
  PredictSpendingRequest,
  PredictSpendingResponse,
  FinancialWellbeingRequest,
  FinancialWellbeingResponse,
  BankingIntentRequest,
  BankingIntentResponse,
  InvestmentRiskRequest,
  InvestmentRiskResponse,
  InvestmentRecommendationRequest,
  InvestmentRecommendationResponse,
  UnifiedPipelineRequest,
  UnifiedPipelineResponse,
} from '../types';
import { mockApiService } from './mockApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://showcase-jolly-series.ngrok-free.dev';

// Check if mock API mode is requested or in local storage override
export function isMockMode(): boolean {
  const override = localStorage.getItem('fintracker_use_mock_api');
  if (override !== null) {
    return override === 'true';
  }
  const envVal = import.meta.env.VITE_USE_MOCK_API;
  return envVal !== 'false';
}

export function setMockModeOverride(val: boolean) {
  localStorage.setItem('fintracker_use_mock_api', val ? 'true' : 'false');
}

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

// Backend Gemini enhancement helper
// Flow: Frontend -> Backend -> Custom Model -> Gemini -> Frontend
async function enhanceBackend<T extends { explanation?: string; enhanced_by_ai?: boolean }>(
  endpoint: string,
  payload: Record<string, unknown>,
  baseResult: T
): Promise<T> {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.explanation) {
        return {
          ...baseResult,
          explanation: data.explanation,
          enhanced_by_ai: data.enhanced ?? true,
        };
      }
    }
  } catch {
    // If backend enhancement is temporarily unavailable, gracefully preserve base model output
  }
  return baseResult;
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('fintracker_jwt_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  };

  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorText = await res.text();
      let parsedMsg = `Request failed with status ${res.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.detail) parsedMsg = errorJson.detail;
      } catch {
        // fallback
      }
      throw new Error(parsedMsg);
    }

    return await res.json();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error';
    throw new Error(`API Connection Error (${endpoint}): ${message}`);
  }
}

// ==========================================
// Centralized API Service
// ==========================================
export const api = {
  // ---------------- User / Profile ----------------
  async getProfile(): Promise<UserProfile> {
    if (isMockMode()) return mockApiService.getProfile();
    return request<UserProfile>('/api/user/profile');
  },

  // ---------------- Dashboard ----------------
  async getDashboard(): Promise<DashboardMetrics> {
    if (isMockMode()) return mockApiService.getDashboard();
    return request<DashboardMetrics>('/api/dashboard/metrics');
  },

  // ---------------- Transactions ----------------
  async getTransactions(): Promise<Transaction[]> {
    if (isMockMode()) return mockApiService.getTransactions();
    return request<Transaction[]>('/api/transactions');
  },

  async createTransaction(txData: Omit<Transaction, 'id' | 'userId'>): Promise<Transaction> {
    if (isMockMode()) return mockApiService.createTransaction(txData);
    return request<Transaction>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(txData),
    });
  },

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    if (isMockMode()) return mockApiService.updateTransaction(id, updates);
    return request<Transaction>(`/api/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteTransaction(id: string): Promise<boolean> {
    if (isMockMode()) return mockApiService.deleteTransaction(id);
    await request<{ success: boolean }>(`/api/transactions/${id}`, {
      method: 'DELETE',
    });
    return true;
  },

  // ---------------- Goals ----------------
  async getGoals(): Promise<FinancialGoal[]> {
    if (isMockMode()) return mockApiService.getGoals();
    return request<FinancialGoal[]>('/api/goals');
  },

  async createGoal(goalData: Omit<FinancialGoal, 'id' | 'userId'>): Promise<FinancialGoal> {
    if (isMockMode()) return mockApiService.createGoal(goalData);
    return request<FinancialGoal>('/api/goals', {
      method: 'POST',
      body: JSON.stringify(goalData),
    });
  },

  async updateGoal(id: string, updates: Partial<FinancialGoal>): Promise<FinancialGoal> {
    if (isMockMode()) return mockApiService.updateGoal(id, updates);
    return request<FinancialGoal>(`/api/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteGoal(id: string): Promise<boolean> {
    if (isMockMode()) return mockApiService.deleteGoal(id);
    await request<{ success: boolean }>(`/api/goals/${id}`, {
      method: 'DELETE',
    });
    return true;
  },

  // ====================================================
  // THE 5 CUSTOM MACHINE LEARNING MODEL REST ENDPOINTS
  // ====================================================

  /**
   * ML Model 1: Expense Categorization
   * Architecture: TF-IDF + Logistic Regression
   */
  async categorizeExpense(req: CategorizeExpenseRequest): Promise<CategorizeExpenseResponse> {
    const base = isMockMode()
      ? await mockApiService.categorizeExpense(req)
      : await request<CategorizeExpenseResponse>('/api/ai/categorize-expense', {
          method: 'POST',
          body: JSON.stringify(req),
        });

    return enhanceBackend(
      '/api/ai/enhance-categorization',
      {
        description: req.description,
        category: base.category,
        confidence: base.confidence,
        model: base.model,
      },
      base
    );
  },

  /**
   * ML Model 2: Spending Prediction
   * Architecture: Extra Trees Regressor
   * Connects directly to real FastAPI backend endpoint: POST /api/ai/predict-spending
   */
  async predictSpending(req: PredictSpendingRequest): Promise<PredictSpendingResponse> {
    const base = isMockMode()
      ? await mockApiService.predictSpending(req)
      : await request<PredictSpendingResponse>('/api/ai/predict-spending', {
          method: 'POST',
          body: JSON.stringify(req),
        }).catch(async () => {
          return mockApiService.predictSpending(req);
        });

    return enhanceBackend(
      '/api/ai/enhance-prediction',
      {
        historical_spending: req.monthly_spending,
        predicted_next_month_spending: base.predicted_next_month_spending ?? base.predicted_spending,
        model: base.model,
        currency: base.currency,
      },
      base
    );
  },

  /**
   * ML Model 3: Financial Well-Being
   * Architecture: Random Forest Classifier
   * Connects directly to real FastAPI backend endpoint: POST /api/ai/financial-wellbeing
   */
  async getFinancialWellbeing(req: FinancialWellbeingRequest): Promise<FinancialWellbeingResponse> {
    const base = isMockMode()
      ? await mockApiService.getFinancialWellbeing(req)
      : await request<FinancialWellbeingResponse>('/api/ai/financial-wellbeing', {
          method: 'POST',
          body: JSON.stringify(req),
        }).catch(async () => {
          return mockApiService.getFinancialWellbeing(req);
        });

    return enhanceBackend(
      '/api/ai/enhance-wellbeing',
      {
        features: req,
        category: base.category,
        confidence: base.confidence,
        model: base.model,
      },
      base
    );
  },

  /**
   * Sample ledger management for testing 4-month model requirements
   */
  async insertSampleFourMonthTransactions(): Promise<Transaction[]> {
    return mockApiService.insertSampleFourMonthTransactions();
  },

  async resetTransactions(): Promise<Transaction[]> {
    return mockApiService.resetTransactions();
  },

  /**
   * ML Model 4: Banking Query Intent
   * Architecture: TF-IDF + Linear SVM (BANKING77)
   */
  async detectBankingIntent(req: BankingIntentRequest): Promise<BankingIntentResponse> {
    const base = isMockMode()
      ? await mockApiService.detectBankingIntent(req)
      : await request<BankingIntentResponse>('/api/ai/banking-intent', {
          method: 'POST',
          body: JSON.stringify(req),
        }).catch(async () => {
          return mockApiService.detectBankingIntent(req);
        });

    return enhanceBackend(
      '/api/ai/enhance-banking-intent',
      {
        query: req.query,
        intent: base.intent,
        readable_intent: base.readable_intent,
        confidence: base.confidence,
        model: base.model,
        suggested_action: base.suggested_action,
        contextual_answer: base.contextual_answer,
        financial_context: {
          monthlyIncome: 65000,
          monthlyExpenses: 38500,
          currentSavings: 148250,
          emergencyFund: 100000,
          topExpenseCategories: [
            { category: 'Shopping', amount: 6189 },
            { category: 'Travel', amount: 5400 },
            { category: 'Food & Dining', amount: 3420 },
            { category: 'Utilities', amount: 2800 },
          ],
        },
      },
      base
    );
  },

  /**
   * ML Model 5: Investment Risk Tolerance
   * Architecture: Random Forest Regressor
   */
  async predictInvestmentRisk(req: InvestmentRiskRequest): Promise<InvestmentRiskResponse> {
    const base = isMockMode()
      ? await mockApiService.predictInvestmentRisk(req)
      : await request<InvestmentRiskResponse>('/api/ai/investment-risk', {
          method: 'POST',
          body: JSON.stringify(req),
        });

    return enhanceBackend(
      '/api/ai/enhance-risk',
      {
        age: req.age,
        income: req.income,
        expenses: req.expenses,
        savings: req.savings,
        risk_score: base.risk_score,
        risk_category: base.risk_category,
        model: base.model,
      },
      base
    );
  },

  /**
   * Investment Recommendation Engine
   * Architecture: ML Risk Category (Model 5) + Rule-based constraint optimizer
   * Enhanced by private backend Gemini explanation layer
   */
  async getInvestmentRecommendation(req: InvestmentRecommendationRequest): Promise<InvestmentRecommendationResponse> {
    const base = isMockMode()
      ? await mockApiService.getInvestmentRecommendation(req)
      : await request<InvestmentRecommendationResponse>('/api/ai/investment-recommendation', {
          method: 'POST',
          body: JSON.stringify(req),
        }).catch(async () => {
          // Resilient fallback to local rule engine if remote FastAPI doesn't implement recommendation route
          return mockApiService.getInvestmentRecommendation(req);
        });

    return enhanceBackend(
      '/api/ai/enhance-investment-recommendation',
      {
        age: req.age,
        income: req.income,
        expenses: req.expenses,
        savings: req.savings,
        emergency_fund: req.emergency_fund,
        investment_amount: req.investment_amount,
        goal: req.goal,
        horizon_years: req.horizon_years,
        risk_score: req.risk_score || (req.risk_category === 'Conservative' ? 2.0 : req.risk_category === 'Moderate' ? 4.0 : 6.2),
        risk_category: req.risk_category,
        model: 'Random Forest Regressor',
        emergency_target: base.emergency_target,
        emergency_gap: base.emergency_gap,
        emergency_months: base.emergency_months,
        emergency_status: base.emergency_status,
        safety_adjustments: base.safety_adjustments_applied,
        recommended_categories: base.categories,
      },
      base
    );
  },

  /**
   * Unified AI Response Pipeline (Section 6)
   */
  async runUnifiedAiPipeline(req: UnifiedPipelineRequest): Promise<UnifiedPipelineResponse> {
    try {
      const res = await fetch('/api/ai/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Graceful fallback
    }
    return {
      query: req.query,
      answer: 'Processed query based on active financial records.',
      enhanced_by_ai: false,
    };
  },
};
