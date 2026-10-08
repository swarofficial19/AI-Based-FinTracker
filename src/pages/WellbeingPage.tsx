import React, { useState } from 'react';
import { WellbeingGauge } from '../components/wellbeing/WellbeingGauge';
import { Card } from '../components/common/Card';
import { api, getApiBaseUrl } from '../services/api';
import { FinancialWellbeingRequest, FinancialWellbeingResponse } from '../types';
import {
  Sliders,
  RefreshCw,
  Loader2,
  AlertCircle,
  HelpCircle,
  Layers,
  HeartHandshake,
  DollarSign,
  Users,
} from 'lucide-react';

const INITIAL_CFPB_FEATURES: FinancialWellbeingRequest = {
  // Cash Flow & Habits
  SAVEHABIT: 4, // 1-5: Agree (Puts money into savings regularly)
  ENDSMEET: 1, // 1-3: Not at all difficult (Difficulty making ends meet)
  ABSORBSHOCK: 3, // 1-4: Probably could absorb unexpected shock
  MATHARDSHIP_1: 1, // 1-4: Never couldn't afford food/essentials
  MANAGE1_2: 4, // 1-5: Very well (Managing day-to-day finances)
  MANAGE1_3: 4, // 1-5: Frequently (Consulting records)
  ACT1_2: 4, // 1-5: Agree (Following a financial plan/budget)

  // Confidence & Resilience
  GOALCONF: 4, // 1-5: Very confident in achieving financial goals
  DISTRESS: 2, // 1-5: A little (Financial anxiety level)
  FS1_1: 4, // 1-5: Very well ("Securing my financial future")
  FS1_7: 4, // 1-5: Very little ("Giving gift would strain finances")
  SWB_1: 6, // 1-7: Agree (Overall satisfaction with life)
  SWB_2: 4, // 1-5: Agree (Optimistic about financial trajectory)

  // Income & Reserves
  PPINCIMP: 7, // 1-9: $75,000 to $99,999 household income bracket
  SAVINGSRANGES: 5, // 1-7: $5,000 to $19,999 liquid savings buffer
  PCTLT200FPL: 0, // 0: Above 200% Federal Poverty Level

  // Demographics & Household
  agecat: 2, // 1-8: 25-34 age bracket
  PPEDUC: 4, // 1-5: Bachelor's degree
  PPHHSIZE: 2, // 1-8: 2 persons in household
  PPMARIT: 1, // 1-6: Married
  EMPLOY: 2, // 1-8: Employed full-time
  HHEDUC: 4, // 1-5: Bachelor's degree in household
  KIDS_NoChildren: 1, // 0 or 1: 1 = No financially dependent children
  PPT18OV: 2, // 1-6: 2 adults age 18+ in household
  RETIRE: 0, // 0 or 1: 0 = Not retired
};

export const WellbeingPage: React.FC = () => {
  const [features, setFeatures] = useState<FinancialWellbeingRequest>(INITIAL_CFPB_FEATURES);
  const [data, setData] = useState<FinancialWellbeingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'habits' | 'outlook' | 'income' | 'demographics'>('habits');

  const handleFeatureChange = (key: keyof FinancialWellbeingRequest, value: number) => {
    setFeatures((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleClassify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.getFinancialWellbeing(features);
      setData(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'FastAPI request failed';
      setError(msg);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Financial Well-Being Classifier
          </h2>
          <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
            Real FastAPI Backend Endpoint: POST /api/ai/financial-wellbeing
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Trained on the CFPB National Financial Well-Being Survey. Evaluates 25 numerical survey indicators into 6 categorical classes.
        </p>
      </div>

      {/* Real Result Display */}
      {data && !loading && (
        <WellbeingGauge data={data} />
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-rose-950">FastAPI Connection Error</span>
              <p className="leading-relaxed text-rose-800">{error}</p>
              <p className="text-[11px] text-rose-700 font-mono">
                Endpoint: POST {getApiBaseUrl()}/api/ai/financial-wellbeing
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 25 CFPB Survey Inputs Questionnaire Form */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-emerald-600" />
            <span>25-Feature CFPB Survey Questionnaire</span>
          </div>
        }
        subtitle="Configure the 25 numerical features defined by the CFPB National Survey model"
      >
        <form onSubmit={handleClassify} className="space-y-5">
          {/* Section Navigation Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('habits')}
              className={`py-2 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'habits'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>1. Habits (7)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('outlook')}
              className={`py-2 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'outlook'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HeartHandshake className="h-3.5 w-3.5" />
              <span>2. Outlook (6)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('income')}
              className={`py-2 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'income'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <DollarSign className="h-3.5 w-3.5" />
              <span>3. Reserves (3)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('demographics')}
              className={`py-2 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'demographics'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>4. Demographics (9)</span>
            </button>
          </div>

          {/* TAB 1: Financial Habits & Cash Flow (7 fields) */}
          {activeTab === 'habits' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  SAVEHABIT: Habit of putting money into savings regularly
                </label>
                <select
                  value={features.SAVEHABIT}
                  onChange={(e) => handleFeatureChange('SAVEHABIT', Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white text-slate-900"
                >
                  <option value={1}>1 - Strongly disagree</option>
                  <option value={2}>2 - Disagree</option>
                  <option value={3}>3 - Neither agree nor disagree</option>
                  <option value={4}>4 - Agree</option>
                  <option value={5}>5 - Strongly agree</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ENDSMEET: Difficulty making ends meet in past 12 months
                </label>
                <select
                  value={features.ENDSMEET}
                  onChange={(e) => handleFeatureChange('ENDSMEET', Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white text-slate-900"
                >
                  <option value={1}>1 - Not at all difficult</option>
                  <option value={2}>2 - Somewhat difficult</option>
                  <option value={3}>3 - Very difficult</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ABSORBSHOCK: Capacity to absorb an unexpected emergency expense
                </label>
                <select
                  value={features.ABSORBSHOCK}
                  onChange={(e) => handleFeatureChange('ABSORBSHOCK', Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white text-slate-900"
                >
                  <option value={1}>1 - I am certain I could not</option>
                  <option value={2}>2 - I could probably not</option>
                  <option value={3}>3 - I could probably</option>
                  <option value={4}>4 - I am certain I could</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  MATHARDSHIP_1: Couldn't afford food or essentials
                </label>
                <select
                  value={features.MATHARDSHIP_1}
                  onChange={(e) => handleFeatureChange('MATHARDSHIP_1', Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white text-slate-900"
                >
                  <option value={1}>1 - Never</option>
                  <option value={2}>2 - Rarely</option>
                  <option value={3}>3 - Sometimes</option>
                  <option value={4}>4 - Often</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  MANAGE1_2: Managing day-to-day finances
                </label>
                <select
                  value={features.MANAGE1_2}
                  onChange={(e) => handleFeatureChange('MANAGE1_2', Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white text-slate-900"
                >
                  <option value={1}>1 - Not well at all</option>
                  <option value={2}>2 - Slightly well</option>
                  <option value={3}>3 - Somewhat well</option>
                  <option value={4}>4 - Very well</option>
                  <option value={5}>5 - Extremely well</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  MANAGE1_3: Consulting financial records & budgets
                </label>
                <select
                  value={features.MANAGE1_3}
                  onChange={(e) => handleFeatureChange('MANAGE1_3', Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white text-slate-900"
                >
                  <option value={1}>1 - Never</option>
                  <option value={2}>2 - Rarely</option>
                  <option value={3}>3 - Sometimes</option>
                  <option value={4}>4 - Frequently</option>
                  <option value={5}>5 - Always</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ACT1_2: Following a financial plan or monthly budget
                </label>
                <select
                  value={features.ACT1_2}
                  onChange={(e) => handleFeatureChange('ACT1_2', Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white text-slate-900"
                >
                  <option value={1}>1 - Strongly disagree</option>
                  <option value={2}>2 - Disagree</option>
                  <option value={3}>3 - Neither agree nor disagree</option>
                  <option value={4}>4 - Agree</option>
                  <option value={5}>5 - Strongly agree</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 2: Confidence & Psychological Resilience (6 fields) */}
          {activeTab === 'outlook' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GOALCONF: Confidence in achieving financial goals
                </label>
                <select
                  value={features.GOALCONF}
                  onChange={(e) => handleFeatureChange('GOALCONF', Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white text-slate-900"
                >
                  <option value={1}>1 - Not at all confident</option>
                  <option value={2}>2 - A little confident</option>
                  <option value={3}>3 - Somewhat confident</option>
                  <option value={4}>4 - Very confident</option>
                  <option value={5}>5 - Extremely confident</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  DISTRESS: Financial stress and anxiety level
                </label>
                <select
                  value={features.DISTRESS}
                  onChange={(e) => handleFeatureChange('DISTRESS', Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white text-slate-900"
                >
                  <option value={1}>1 - Not at all</option>
                  <option value={2}>2 - A little</option>
                  <option value={3}>3 - Somewhat</option>
                  <option value={4}>4 - Very</option>
                  <option value={5}>5 - Extremely</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  FS1_1: "I am securing my financial future"
                </label>
                <select
                  value={features.FS1_1}
                  onChange={(e) => handleFeatureChange('FS1_1', Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white text-slate-900"
                >
                  <option value={1}>1 - Not at all</option>
                  <option value={2}>2 - Very little</option>
                  <option value={3}>3 - Somewhat</option>
                  <option value={4}>4 - Very well</option>
                  <option value={5}>5 - Completely</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  FS1_7: "Giving a gift would put strain on my finances"
                </label>
                <select
                  value={features.FS1_7}
                  onChange={(e) => handleFeatureChange('FS1_7', Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white text-slate-900"
                >
                  <option value={1}>1 - Completely</option>
                  <option value={2}>2 - Very well</option>
                  <option value={3}>3 - Somewhat</option>
                  <option value={4}>4 - Very little</option>
                  <option value={5}>5 - Not at all</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  SWB_1: Overall life satisfaction (1-7 scale)
                </label>
                <select
                  value={features.SWB_1}
                  onChange={(e) => handleFeatureChange('SWB_1', Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white text-slate-900"
                >
                  <option value={1}>1 - Strongly disagree</option>
                  <option value={2}>2 - Disagree</option>
                  <option value={3}>3 - Slightly disagree</option>
                  <option value={4}>4 - Neutral</option>
                  <option value={5}>5 - Slightly agree</option>
                  <option value={6}>6 - Agree</option>
                  <option value={7}>7 - Strongly agree</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  SWB_2: Optimistic about financial trajectory
                </label>
                <select
                  value={features.SWB_2}
                  onChange={(e) => handleFeatureChange('SWB_2', Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white text-slate-900"
                >
                  <option value={1}>1 - Strongly disagree</option>
                  <option value={2}>2 - Disagree</option>
                  <option value={3}>3 - Neither agree nor disagree</option>
                  <option value={4}>4 - Agree</option>
                  <option value={5}>5 - Strongly agree</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 3: Income & Liquid Reserves (3 fields) */}
          {activeTab === 'income' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  PPINCIMP: Household Income Bracket
                </label>
                <select
                  value={features.PPINCIMP}
                  onChange={(e) => handleFeatureChange('PPINCIMP', Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white text-slate-900"
                >
                  <option value={1}>1 - Less than $20,000</option>
                  <option value={2}>2 - $20,000 to $29,999</option>
                  <option value={3}>3 - $30,000 to $39,999</option>
                  <option value={4}>4 - $40,000 to $49,999</option>
                  <option value={5}>5 - $50,000 to $59,999</option>
                  <option value={6}>6 - $60,000 to $74,999</option>
                  <option value={7}>7 - $75,000 to $99,999</option>
                  <option value={8}>8 - $100,000 to $149,999</option>
                  <option value={9}>9 - $150,000 or more</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  SAVINGSRANGES: Liquid Savings Balance
                </label>
                <select
                  value={features.SAVINGSRANGES}
                  onChange={(e) => handleFeatureChange('SAVINGSRANGES', Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white text-slate-900"
                >
                  <option value={1}>1 - $0 (No savings)</option>
                  <option value={2}>2 - $1 to $99</option>
                  <option value={3}>3 - $100 to $999</option>
                  <option value={4}>4 - $1,000 to $4,999</option>
                  <option value={5}>5 - $5,000 to $19,999</option>
                  <option value={6}>6 - $20,000 to $74,999</option>
                  <option value={7}>7 - $75,000 or more</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  PCTLT200FPL: Below 200% Federal Poverty Line
                </label>
                <select
                  value={features.PCTLT200FPL}
                  onChange={(e) => handleFeatureChange('PCTLT200FPL', Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white text-slate-900"
                >
                  <option value={0}>0 - No (Above 200% FPL)</option>
                  <option value={1}>1 - Yes (Below 200% FPL)</option>
                  <option value={-1}>-1 - Unclassified</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 4: Demographics & Household (9 fields) */}
          {activeTab === 'demographics' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  agecat: Age Category
                </label>
                <select
                  value={features.agecat}
                  onChange={(e) => handleFeatureChange('agecat', Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white text-slate-900"
                >
                  <option value={1}>1 - 18 to 24</option>
                  <option value={2}>2 - 25 to 34</option>
                  <option value={3}>3 - 35 to 44</option>
                  <option value={4}>4 - 45 to 54</option>
                  <option value={5}>5 - 55 to 61</option>
                  <option value={6}>6 - 62 to 69</option>
                  <option value={7}>7 - 70 to 74</option>
                  <option value={8}>8 - 75+</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  PPEDUC: Education Level
                </label>
                <select
                  value={features.PPEDUC}
                  onChange={(e) => handleFeatureChange('PPEDUC', Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white text-slate-900"
                >
                  <option value={1}>1 - Less than high school</option>
                  <option value={2}>2 - High school diploma</option>
                  <option value={3}>3 - Some college / Associate</option>
                  <option value={4}>4 - Bachelor's degree</option>
                  <option value={5}>5 - Graduate degree</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  HHEDUC: Household Highest Education
                </label>
                <select
                  value={features.HHEDUC}
                  onChange={(e) => handleFeatureChange('HHEDUC', Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white text-slate-900"
                >
                  <option value={1}>1 - Less than high school</option>
                  <option value={2}>2 - High school diploma</option>
                  <option value={3}>3 - Some college / Associate</option>
                  <option value={4}>4 - Bachelor's degree</option>
                  <option value={5}>5 - Graduate degree</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  PPHHSIZE: Total Household Size
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={features.PPHHSIZE}
                  onChange={(e) => handleFeatureChange('PPHHSIZE', Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  PPT18OV: Adults Age 18+ in Household
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={features.PPT18OV}
                  onChange={(e) => handleFeatureChange('PPT18OV', Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  PPMARIT: Marital Status
                </label>
                <select
                  value={features.PPMARIT}
                  onChange={(e) => handleFeatureChange('PPMARIT', Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white text-slate-900"
                >
                  <option value={1}>1 - Married</option>
                  <option value={2}>2 - Living with partner</option>
                  <option value={3}>3 - Divorced</option>
                  <option value={4}>4 - Separated</option>
                  <option value={5}>5 - Never married</option>
                  <option value={6}>6 - Widowed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  EMPLOY: Employment Status
                </label>
                <select
                  value={features.EMPLOY}
                  onChange={(e) => handleFeatureChange('EMPLOY', Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white text-slate-900"
                >
                  <option value={1}>1 - Self-employed</option>
                  <option value={2}>2 - Work full-time</option>
                  <option value={3}>3 - Work part-time</option>
                  <option value={4}>4 - Homemaker</option>
                  <option value={5}>5 - Unemployed</option>
                  <option value={6}>6 - Student</option>
                  <option value={7}>7 - Retired</option>
                  <option value={8}>8 - Unable to work / Disabled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  KIDS_NoChildren: Dependent Children Status
                </label>
                <select
                  value={features.KIDS_NoChildren}
                  onChange={(e) => handleFeatureChange('KIDS_NoChildren', Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white text-slate-900"
                >
                  <option value={1}>1 - No financially dependent children</option>
                  <option value={0}>0 - Has dependent children</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  RETIRE: Retirement Status
                </label>
                <select
                  value={features.RETIRE}
                  onChange={(e) => handleFeatureChange('RETIRE', Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white text-slate-900"
                >
                  <option value={0}>0 - Not retired</option>
                  <option value={1}>1 - Retired</option>
                </select>
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 font-mono">
              Features Ready: 25 / 25 numerical features mapped to CFPB specification
            </span>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Evaluating Random Forest Model on FastAPI...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Classify Financial Well-Being</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};
