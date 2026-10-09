import React, { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  TrendingUp,
  HeartPulse,
  MessageSquareCode,
  ShieldCheck,
  Play,
  Loader2,
  CheckCircle2,
  Cpu,
  Info,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  CategorizeExpenseResponse,
  PredictSpendingResponse,
  FinancialWellbeingResponse,
  BankingIntentResponse,
  InvestmentRiskResponse,
} from '../types';
import { formatINR } from '../utils/formatters';

export const AiInsightsPage: React.FC = () => {
  const { user } = useAuth();
  const isDemo =
    user?.id === 'usr_fintracker_demo' ||
    user?.email?.toLowerCase() === 'arjun.sharma@fintracker.ai';

  // Model 1: Expense Categorization Test State
  const [m1Input, setM1Input] = useState(
    isDemo ? 'Bought fresh organic vegetables from local market' : ''
  );
  const [m1Loading, setM1Loading] = useState(false);
  const [m1Result, setM1Result] = useState<CategorizeExpenseResponse | null>(
    isDemo
      ? {
          category: 'Groceries',
          confidence: 0.94,
          model: 'TF-IDF + Logistic Regression',
        }
      : null
  );

  // Model 2: Spending Prediction Test State (Real FastAPI: POST /api/ai/predict-spending)
  const [m2SpendingInput, setM2SpendingInput] = useState<string>(
    isDemo ? '36200, 39400, 37800, 40100' : '0, 0, 0, 0'
  );
  const [m2Loading, setM2Loading] = useState(false);
  const [m2Error, setM2Error] = useState<string | null>(null);
  const [m2Result, setM2Result] = useState<PredictSpendingResponse | null>(null);

  // Model 3: Financial Well-Being Test State (Real FastAPI: POST /api/ai/financial-wellbeing)
  const [m3Loading, setM3Loading] = useState(false);
  const [m3Error, setM3Error] = useState<string | null>(null);
  const [m3Result, setM3Result] = useState<FinancialWellbeingResponse | null>(null);

  // Model 4: Banking Intent Test State
  const [m4Input, setM4Input] = useState(
    isDemo ? 'Why has my transfer not reached the recipient?' : ''
  );
  const [m4Loading, setM4Loading] = useState(false);
  const [m4Result, setM4Result] = useState<BankingIntentResponse | null>(
    isDemo
      ? {
          intent: 'transfer_not_received_by_recipient',
          readable_intent: 'Transfer Not Received by Recipient',
          confidence: 0.94,
          model: 'TF-IDF + Linear SVM (BANKING77)',
          suggested_action: 'Verify beneficiary UTR number with bank clearance window.',
        }
      : null
  );

  // Model 5: Investment Risk State
  const [m5Age, setM5Age] = useState(isDemo ? 26 : 25);
  const [m5Horizon, setM5Horizon] = useState(5);
  const [m5Loading, setM5Loading] = useState(false);
  const [m5Result, setM5Result] = useState<InvestmentRiskResponse | null>(
    isDemo
      ? {
          risk_score: 3.67,
          risk_category: 'Moderate',
          model: 'Random Forest Regressor',
          breakdown: { capacity_score: 4.1, horizon_factor: 5, stability_factor: 2.6 },
        }
      : null
  );

  // Handlers
  const handleTestM1 = async () => {
    if (!m1Input.trim()) return;
    setM1Loading(true);
    try {
      const res = await api.categorizeExpense({ description: m1Input });
      setM1Result(res);
    } finally {
      setM1Loading(false);
    }
  };

  const handleTestM2 = async () => {
    setM2Error(null);
    const spendingValues = m2SpendingInput
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n) && n > 0);

    if (spendingValues.length < 4) {
      setM2Error(
        `At least 4 months of historical spending must be provided to run Extra Trees Regressor (currently provided: ${spendingValues.length}).`
      );
      return;
    }

    setM2Loading(true);
    try {
      const res = await api.predictSpending({ monthly_spending: spendingValues });
      setM2Result(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'FastAPI request failed';
      setM2Error(msg);
      setM2Result(null);
    } finally {
      setM2Loading(false);
    }
  };

  const handleTestM3 = async () => {
    setM3Loading(true);
    setM3Error(null);
    try {
      const res = await api.getFinancialWellbeing({
        PPINCIMP: 7,
        SAVINGSRANGES: 4,
        ENDSMEET: 1,
        ABSORBSHOCK: 3,
        MATHARDSHIP_1: 2,
        SAVEHABIT: 4,
        GOALCONF: 4,
        MANAGE1_2: 4,
        MANAGE1_3: 3,
        DISTRESS: 2,
        ACT1_2: 4,
        FS1_1: 4,
        FS1_7: 4,
        SWB_1: 5,
        SWB_2: 5,
        agecat: 3,
        PPEDUC: 4,
        PPHHSIZE: 2,
        PPMARIT: 1,
        EMPLOY: 1,
        HHEDUC: 4,
        KIDS_NoChildren: 1,
        PPT18OV: 2,
        PCTLT200FPL: 0,
        RETIRE: 0,
      });
      setM3Result(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'FastAPI request failed';
      setM3Error(msg);
      setM3Result(null);
    } finally {
      setM3Loading(false);
    }
  };

  const handleTestM4 = async () => {
    if (!m4Input.trim()) return;
    setM4Loading(true);
    try {
      const res = await api.detectBankingIntent({ query: m4Input });
      setM4Result(res);
    } finally {
      setM4Loading(false);
    }
  };

  const handleTestM5 = async () => {
    setM5Loading(true);
    try {
      const res = await api.predictInvestmentRisk({
        age: m5Age,
        income: isDemo ? 65000 : (user?.monthlyIncome ?? 0),
        expenses: isDemo ? 38500 : (user?.monthlyExpenses ?? 0),
        savings: isDemo ? 148250 : (user?.currentSavings ?? 0),
        emergency_fund: isDemo ? 100000 : (user?.emergencyFund ?? 0),
        investment_amount: isDemo ? 10000 : 0,
        goal: 'Wealth Creation',
        horizon_years: m5Horizon,
      });
      setM5Result(res);
    } finally {
      setM5Loading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">University AI/ML Architecture</span>
              <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                scikit-learn Ecosystem
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
              The 5 Custom-Trained Machine Learning Models
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              FinTracker AI does not outsource core quantitative decision-making to generic chat LLMs. Five dedicated, mathematically grounded machine learning models power categorization, forecasting, well-being indexing, banking intent classification, and risk estimation.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="rounded-lg bg-slate-100 p-2.5 text-center font-mono">
              <span className="block text-xs text-slate-500 font-sans">Pipeline</span>
              <span className="text-sm font-bold text-slate-900">Python · FastAPI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of the 5 Custom Models */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MODEL 1 */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                MODEL 1
              </span>
              <span className="font-semibold text-slate-900 text-sm">Expense Categorization</span>
            </div>
          }
          subtitle="Architecture: TF-IDF Vectorizer + Logistic Regression (Multi-class)"
        >
          <div className="space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Purpose:</strong> Predicts transaction category from short natural language transaction descriptions (e.g. UPI memos, SMS notifications).
            </p>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Live Model Test Runner
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={m1Input}
                  onChange={(e) => setM1Input(e.target.value)}
                  placeholder="Enter transaction narrative..."
                  className="flex-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-hidden focus:border-slate-900"
                />
                <button
                  onClick={handleTestM1}
                  disabled={m1Loading}
                  className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50 shrink-0"
                >
                  {m1Loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3 w-3" />}
                  <span>Infer</span>
                </button>
              </div>

              {m1Result && (
                <div className="mt-2 rounded bg-white p-2.5 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-600">Predicted Category:</span>
                    <strong className="text-emerald-700 text-sm">{m1Result.category}</strong>
                  </div>
                  <div className="flex items-center justify-between font-mono mt-1 text-[11px] text-slate-500">
                    <span>Model Confidence:</span>
                    <span className="font-bold">{(m1Result.confidence * 100).toFixed(1)}%</span>
                  </div>
                  {m1Result.explanation && (
                    <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-700 leading-relaxed">
                      <span className="font-semibold text-slate-800 block text-[11px] mb-0.5">Insight:</span>
                      {m1Result.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-600 font-mono">
              Endpoint: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">POST /api/ai/categorize-expense</code>
            </div>
          </div>
        </Card>

        {/* MODEL 2 */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                MODEL 2
              </span>
              <span className="font-semibold text-slate-900 text-sm">Spending Prediction</span>
            </div>
          }
          subtitle="Architecture: Extra Trees Regressor (Extremely Randomized Trees)"
        >
          <div className="space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Purpose:</strong> Predicts expected expenditure for subsequent month from sequential historical expenditure patterns.
            </p>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Regression Forecast (Real FastAPI)
                </span>
                <button
                  onClick={handleTestM2}
                  disabled={m2Loading}
                  className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {m2Loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                  <span>Compute</span>
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Historical Monthly Spending (min. 4 months, comma-separated)
                </label>
                <input
                  type="text"
                  value={m2SpendingInput}
                  onChange={(e) => setM2SpendingInput(e.target.value)}
                  placeholder="e.g. 36200, 39400, 37800, 40100"
                  className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-slate-900"
                />
              </div>

              {m2Error && (
                <div className="rounded bg-rose-50 p-2 border border-rose-200 text-xs text-rose-800">
                  {m2Error}
                </div>
              )}

              {m2Result && (
                <div className="rounded bg-white p-2.5 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Predicted Next Month Spending:</span>
                    <span className="text-sm font-bold font-mono text-slate-900">
                      {formatINR(m2Result.predicted_next_month_spending ?? m2Result.predicted_spending)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Model: {m2Result.model || 'Extra Trees Regressor'}</span>
                    <span>Currency: {m2Result.currency || 'INR'}</span>
                  </div>
                  {m2Result.explanation && (
                    <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-700 leading-relaxed font-sans">
                      <span className="font-semibold text-slate-800 block text-[11px] mb-0.5">Forecast Analysis:</span>
                      {m2Result.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-600 font-mono">
              Endpoint: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">POST /api/ai/predict-spending</code>
            </div>
          </div>
        </Card>

        {/* MODEL 3 */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                MODEL 3
              </span>
              <span className="font-semibold text-slate-900 text-sm">Financial Well-Being Classifier</span>
            </div>
          }
          subtitle="Architecture: Random Forest Classifier (Multi-Class Solvency)"
        >
          <div className="space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Purpose:</strong> Evaluates holistic solvency, emergency preparedness, and savings surplus to assign categorical resilience scores across 25 CFPB survey vectors.
            </p>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  25-Feature Solvency (Real FastAPI)
                </span>
                <button
                  onClick={handleTestM3}
                  disabled={m3Loading}
                  className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {m3Loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                  <span>Evaluate</span>
                </button>
              </div>

              {m3Error && (
                <div className="rounded bg-rose-50 p-2 border border-rose-200 text-xs text-rose-800">
                  {m3Error}
                </div>
              )}

              {m3Result && (
                <div className="rounded bg-white p-2.5 border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Classification Category:</span>
                    <strong className="text-emerald-700 font-mono text-sm">{m3Result.category}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Model Confidence:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {(m3Result.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Model: {m3Result.model || 'Random Forest Classifier'}
                  </div>
                  {m3Result.explanation && (
                    <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-700 leading-relaxed font-sans">
                      <span className="font-semibold text-slate-800 block text-[11px] mb-0.5">Assessment Summary:</span>
                      {m3Result.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-600 font-mono">
              Endpoint: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">POST /api/ai/financial-wellbeing</code>
            </div>
          </div>
        </Card>

        {/* MODEL 4 */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                MODEL 4
              </span>
              <span className="font-semibold text-slate-900 text-sm">BANKING77 Query Intent</span>
            </div>
          }
          subtitle="Architecture: TF-IDF + Linear Support Vector Machine (Linear SVM)"
        >
          <div className="space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Purpose:</strong> Fine-grained semantic classification of financial and banking user queries across 77 verified banking intents.
            </p>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Intent Parser
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={m4Input}
                  onChange={(e) => setM4Input(e.target.value)}
                  placeholder="Ask banking question..."
                  className="flex-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-hidden focus:border-slate-900"
                />
                <button
                  onClick={handleTestM4}
                  disabled={m4Loading}
                  className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50 shrink-0"
                >
                  {m4Loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3 w-3" />}
                  <span>Detect</span>
                </button>
              </div>

              {m4Result && (
                <div className="rounded bg-white p-2.5 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Detected Intent:</span>
                    <strong className="text-slate-900 font-mono text-[11px]">{m4Result.intent}</strong>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                    <span>SVM Confidence:</span>
                    <span className="font-mono font-bold">{(m4Result.confidence * 100).toFixed(1)}%</span>
                  </div>
                  {m4Result.explanation && (
                    <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-700 leading-relaxed font-sans">
                      <span className="font-semibold text-slate-800 block text-[11px] mb-0.5">Advisory Response:</span>
                      {m4Result.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-600 font-mono">
              Endpoint: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">POST /api/ai/banking-intent</code>
            </div>
          </div>
        </Card>

        {/* MODEL 5 */}
        <Card
          className="lg:col-span-2"
          title={
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                MODEL 5
              </span>
              <span className="font-semibold text-slate-900 text-sm">Investment Risk Tolerance</span>
            </div>
          }
          subtitle="Architecture: Random Forest Regressor (Continuous Scale 1.0 - 7.0)"
        >
          <div className="space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Purpose:</strong> Predicts risk tolerance score from age, emergency runway, surplus ratio, and investment horizon. Passes directly into the rule-based investment recommendation engine.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Age</label>
                <input
                  type="number"
                  value={m5Age}
                  onChange={(e) => setM5Age(Number(e.target.value))}
                  className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Horizon (Years)</label>
                <input
                  type="number"
                  value={m5Horizon}
                  onChange={(e) => setM5Horizon(Number(e.target.value))}
                  className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs font-mono"
                />
              </div>

              <div>
                <button
                  onClick={handleTestM5}
                  disabled={m5Loading}
                  className="w-full mt-3.5 inline-flex items-center justify-center gap-1 rounded bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                >
                  {m5Loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                  <span>Run Risk Model</span>
                </button>
              </div>
            </div>

            {m5Result && (
              <div className="rounded-lg bg-white border border-slate-200 p-3 text-xs space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-slate-500 font-medium">Predicted Risk Score:</span>{' '}
                    <strong className="text-slate-900 font-mono text-sm ml-1">{m5Result.risk_score} / 7.00</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Risk Category:</span>{' '}
                    <span className="ml-1 px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {m5Result.risk_category}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Capacity: {m5Result.breakdown.capacity_score} · Stability: {m5Result.breakdown.stability_factor}x
                  </div>
                </div>
                {m5Result.explanation && (
                  <div className="pt-2 border-t border-slate-100 text-xs text-slate-700 leading-relaxed font-sans">
                    <span className="font-semibold text-slate-800 block text-[11px] mb-0.5">Risk Commentary:</span>
                    {m5Result.explanation}
                  </div>
                )}
              </div>
            )}

            <div className="text-[11px] text-slate-600 font-mono">
              Endpoint: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">POST /api/ai/investment-risk</code>
            </div>
          </div>
        </Card>
      </div>

      {/* Safety Notice */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 leading-relaxed flex items-start gap-2.5">
        <Info className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-800">Academic & Project Transparency Notice:</strong> AI-generated predictions and ML metrics are statistical estimates based on historical features and training sets. They must not be treated as certified financial, legal, or guaranteed outcomes.
        </div>
      </div>
    </div>
  );
};
