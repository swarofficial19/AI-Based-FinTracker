import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { RiskMeter } from '../components/advisor/RiskMeter';
import { AllocationChart } from '../components/advisor/AllocationChart';
import { api } from '../services/api';
import { InvestmentRiskResponse, InvestmentRecommendationResponse } from '../types';
import { formatINR } from '../utils/formatters';
import { ShieldCheck, Play, Loader2, ArrowRight, Sparkles, SlidersHorizontal, Cpu, Layers } from 'lucide-react';

export const InvestmentAdvisorPage: React.FC = () => {
  // Input form state
  const [age, setAge] = useState(26);
  const [income, setIncome] = useState(65000);
  const [expenses, setExpenses] = useState(38500);
  const [savings, setSavings] = useState(148250);
  const [emergencyFund, setEmergencyFund] = useState(100000);
  const [investAmount, setInvestAmount] = useState(10000);
  const [goal, setGoal] = useState('Wealth Creation');
  const [horizonYears, setHorizonYears] = useState(7);

  // Result states
  const [riskData, setRiskData] = useState<InvestmentRiskResponse | null>(null);
  const [recData, setRecData] = useState<InvestmentRecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAdvisoryEngine = async (overrideParams?: {
    age?: number;
    income?: number;
    expenses?: number;
    savings?: number;
    emergencyFund?: number;
    investAmount?: number;
    goal?: string;
    horizonYears?: number;
  }) => {
    setLoading(true);
    setError(null);

    const a = overrideParams?.age ?? age;
    const inc = overrideParams?.income ?? income;
    const exp = overrideParams?.expenses ?? expenses;
    const sav = overrideParams?.savings ?? savings;
    const ef = overrideParams?.emergencyFund ?? emergencyFund;
    const inv = overrideParams?.investAmount ?? investAmount;
    const g = overrideParams?.goal ?? goal;
    const hor = overrideParams?.horizonYears ?? horizonYears;

    try {
      // Step 1: Call Model 5 (Random Forest Regressor)
      const riskRes = await api.predictInvestmentRisk({
        age: a,
        income: inc,
        expenses: exp,
        savings: sav,
        emergency_fund: ef,
        investment_amount: inv,
        goal: g,
        horizon_years: hor,
      });
      setRiskData(riskRes);

      // Step 2: Call Investment Recommendation Engine with risk category & score
      const recRes = await api.getInvestmentRecommendation({
        age: a,
        income: inc,
        expenses: exp,
        savings: sav,
        emergency_fund: ef,
        investment_amount: inv,
        goal: g,
        horizon_years: hor,
        risk_category: riskRes.risk_category,
        risk_score: riskRes.risk_score,
      });
      setRecData(recRes);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Advisory evaluation failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAdvisoryEngine();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runAdvisoryEngine();
  };

  const applyPreset = (preset: {
    age: number;
    income: number;
    expenses: number;
    savings: number;
    emergencyFund: number;
    investAmount: number;
    goal: string;
    horizonYears: number;
  }) => {
    setAge(preset.age);
    setIncome(preset.income);
    setExpenses(preset.expenses);
    setSavings(preset.savings);
    setEmergencyFund(preset.emergencyFund);
    setInvestAmount(preset.investAmount);
    setGoal(preset.goal);
    setHorizonYears(preset.horizonYears);
    runAdvisoryEngine(preset);
  };

  return (
    <div className="space-y-6">
      {/* Page Header with Pipeline Flow */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-[11px] font-semibold text-indigo-700 mb-2">
              <Cpu className="h-3 w-3" />
              <span>Multi-Asset Advisory Engine</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              AI & Rule-Based Investment Advisor
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Connects Model 5 (Random Forest Regressor) with 6-month safety constraint optimization and personalized strategy recommendations
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 block font-mono">Currency Standard</span>
            <span className="text-xs font-bold text-slate-700 font-mono">INR (₹) · Pan-India Vehicles</span>
          </div>
        </div>

        {/* Pipeline Architecture Indicator */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
          <span className="font-semibold text-slate-700">Advisory Pipeline:</span>
          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">User Profile</span>
          <ArrowRight className="h-3 w-3 text-slate-400" />
          <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-medium">
            Model 5: Random Forest Regressor
          </span>
          <ArrowRight className="h-3 w-3 text-slate-400" />
          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
            Rule-Based Allocation Engine
          </span>
          <ArrowRight className="h-3 w-3 text-slate-400" />
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-medium">
            Recommended Vehicles
          </span>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-600" />
            <span>Interactive Financial Profile Simulation:</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() =>
                applyPreset({
                  age: 24,
                  income: 60000,
                  expenses: 28000,
                  savings: 120000,
                  emergencyFund: 180000,
                  investAmount: 12000,
                  goal: 'Wealth Creation',
                  horizonYears: 10,
                })
              }
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors"
            >
              Early Career Aggressive
            </button>
            <button
              type="button"
              onClick={() =>
                applyPreset({
                  age: 34,
                  income: 110000,
                  expenses: 65000,
                  savings: 450000,
                  emergencyFund: 390000,
                  investAmount: 25000,
                  goal: 'Home Purchase',
                  horizonYears: 6,
                })
              }
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors"
            >
              Family Balanced (Moderate)
            </button>
            <button
              type="button"
              onClick={() =>
                applyPreset({
                  age: 52,
                  income: 140000,
                  expenses: 80000,
                  savings: 1500000,
                  emergencyFund: 500000,
                  investAmount: 35000,
                  goal: 'Retirement',
                  horizonYears: 3,
                })
              }
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors"
            >
              Conservative Capital Preservation
            </button>
            <button
              type="button"
              onClick={() =>
                applyPreset({
                  age: 28,
                  income: 70000,
                  expenses: 48000,
                  savings: 60000,
                  emergencyFund: 40000,
                  investAmount: 10000,
                  goal: 'Wealth Creation',
                  horizonYears: 5,
                })
              }
              className="px-2.5 py-1 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 font-medium transition-colors"
            >
              Emergency Deficit Scenario
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Financial Profile Input Form */}
        <div className="lg:col-span-5">
          <Card
            title="Investor Profile & Parameters"
            subtitle="Input criteria for ML risk regression and safety engine"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Age (Years)</label>
                  <input
                    type="number"
                    min="18"
                    max="90"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Horizon (Years)</label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={horizonYears}
                    onChange={(e) => setHorizonYears(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Income (₹)</label>
                  <input
                    type="number"
                    step="1000"
                    value={income}
                    onChange={(e) => setIncome(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Expenses (₹)</label>
                  <input
                    type="number"
                    step="500"
                    value={expenses}
                    onChange={(e) => setExpenses(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Current Savings (₹)</label>
                  <input
                    type="number"
                    step="5000"
                    value={savings}
                    onChange={(e) => setSavings(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Fund (₹)</label>
                  <input
                    type="number"
                    step="5000"
                    value={emergencyFund}
                    onChange={(e) => setEmergencyFund(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Monthly Capital to Invest (₹)
                </label>
                <input
                  type="number"
                  step="1000"
                  min="500"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Financial Goal</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white"
                >
                  <option value="Wealth Creation">Wealth Creation</option>
                  <option value="Retirement">Retirement</option>
                  <option value="Emergency Reserve">Emergency Reserve</option>
                  <option value="Education">Higher Education</option>
                  <option value="Home Purchase">Home Purchase</option>
                  <option value="Short-Term Goal">Short-Term Capital Goal</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-xs"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Computing ML Risk & Allocation...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5" />
                      <span>Generate AI Investment Recommendation</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Column: Risk Meter & Comprehensive Allocation Chart */}
        <div className="lg:col-span-7 space-y-6">
          {riskData && (
            <RiskMeter
              score={riskData.risk_score}
              category={riskData.risk_category}
              model={riskData.model}
              breakdown={riskData.breakdown}
            />
          )}

          {recData && <AllocationChart recommendation={recData} />}
        </div>
      </div>
    </div>
  );
};
