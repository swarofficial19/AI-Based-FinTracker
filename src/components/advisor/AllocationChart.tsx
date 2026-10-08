import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { InvestmentRecommendationResponse, RecommendedVehicle } from '../../types';
import { formatINR } from '../../utils/formatters';
import {
  AlertTriangle,
  ShieldCheck,
  Info,
  Sparkles,
  TrendingUp,
  Wallet,
  Landmark,
  Coins,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';

interface AllocationChartProps {
  recommendation: InvestmentRecommendationResponse;
}

export const AllocationChart: React.FC<AllocationChartProps> = ({ recommendation }) => {
  const {
    allocation,
    allocated_amounts,
    asset_class_allocation,
    asset_class_amounts,
    categories = [],
    safety_adjustments_applied = [],
    warning,
    explanation,
    recommended_investment,
    emergency_target,
    emergency_gap,
    emergency_months = 3.5,
    emergency_status = 'Needs Attention',
    enhanced_by_ai = false,
  } = recommendation;

  const [activeTab, setActiveTab] = useState<'vehicles' | 'assetClasses'>('vehicles');

  // Chart data for Asset Classes
  const assetClassData = [
    {
      name: 'Equity / Stocks',
      value: asset_class_allocation?.equity ?? allocation.equity,
      amount: asset_class_amounts?.equity_inr ?? allocated_amounts.equity_inr,
      color: '#2563EB',
    },
    {
      name: 'Debt & Fixed Income',
      value: asset_class_allocation?.debt_fixed_income ?? allocation.low_risk,
      amount: asset_class_amounts?.debt_fixed_income_inr ?? allocated_amounts.low_risk_inr,
      color: '#0D9488',
    },
    {
      name: 'Hybrid / Balanced',
      value: asset_class_allocation?.hybrid ?? 0,
      amount: asset_class_amounts?.hybrid_inr ?? 0,
      color: '#6366F1',
    },
    {
      name: 'Gold & Commodities',
      value: asset_class_allocation?.gold ?? 0,
      amount: asset_class_amounts?.gold_inr ?? 0,
      color: '#EAB308',
    },
    {
      name: 'Cash / Liquid',
      value: asset_class_allocation?.liquid_cash ?? allocation.cash,
      amount: asset_class_amounts?.liquid_cash_inr ?? allocated_amounts.cash_inr,
      color: '#F97316',
    },
  ].filter((item) => item.value > 0);

  // Status color styles for emergency reserve
  const emergencyStatusConfig = {
    Healthy: {
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
      label: 'Healthy Reserve (6+ Months)',
      barColor: 'bg-emerald-500',
    },
    'Needs Attention': {
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: AlertTriangle,
      label: 'Needs Attention (3–6 Months)',
      barColor: 'bg-amber-500',
    },
    'Critical Reserve Gap': {
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: AlertCircle,
      label: 'Critical Reserve Gap (<3 Months)',
      barColor: 'bg-rose-500',
    },
  }[emergency_status] || {
    badge: 'bg-slate-50 text-slate-700 border-slate-200',
    icon: AlertTriangle,
    label: emergency_status,
    barColor: 'bg-slate-500',
  };

  const StatusIcon = emergencyStatusConfig.icon;
  const currentEmergencyCalculated = Math.max(0, emergency_target - emergency_gap);
  const emergencyCoveragePct = emergency_target > 0 ? Math.min(100, Math.round((currentEmergencyCalculated / emergency_target) * 100)) : 100;

  return (
    <div className="space-y-6">
      {/* 1. Emergency Safety Alert / Warning Banner if gap exists */}
      {warning && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-4 text-xs text-amber-950 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <span className="font-semibold text-amber-950">Safety Engine Advisory Notice</span>
              <p className="leading-relaxed text-amber-900">{warning}</p>
              <div className="flex flex-wrap gap-4 font-mono text-[11px] text-amber-900 pt-1">
                <span>6-Month Safety Target: <strong>{formatINR(emergency_target)}</strong></span>
                <span>Current Reserve: <strong>{formatINR(currentEmergencyCalculated)}</strong></span>
                <span>Deficit Gap: <strong>{formatINR(emergency_gap)}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Emergency Fund & Financial Health Check Widget */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <span className="text-xs text-slate-500 font-medium">Financial Safety Engine</span>
            <h4 className="text-sm font-semibold text-slate-900">Emergency Liquidity & Health Check</h4>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border ${emergencyStatusConfig.badge}`}>
            <StatusIcon className="h-3.5 w-3.5" />
            {emergencyStatusConfig.label}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">
              Reserve Coverage: <strong className="text-slate-900 font-mono">{emergency_months.toFixed(1)} months</strong> of expenses
            </span>
            <span className="font-mono text-xs font-semibold text-slate-700">
              {formatINR(currentEmergencyCalculated)} / {formatINR(emergency_target)} ({emergencyCoveragePct}%)
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${emergencyStatusConfig.barColor}`}
              style={{ width: `${emergencyCoveragePct}%` }}
            />
          </div>

          {/* Safety Engine Adjustments Applied */}
          {safety_adjustments_applied.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-700 block">Safety Adjustments Enforced:</span>
              <ul className="space-y-1 text-xs text-slate-600">
                {safety_adjustments_applied.map((adj, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                    <ShieldCheck className="h-3.5 w-3.5 text-indigo-600 shrink-0 mt-0.5" />
                    <span>{adj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 3. Asset Allocation & Donut Overview */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <span className="text-xs text-slate-500 font-medium">Recommended Portfolio</span>
            <h4 className="text-sm font-semibold text-slate-900">Asset Class Allocation Breakdown</h4>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Monthly Investable</span>
            <span className="font-mono text-sm font-bold text-slate-900">
              {formatINR(recommended_investment)}/mo
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Donut Chart */}
          <div className="relative h-48 w-48 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetClassData}
                  innerRadius={52}
                  outerRadius={76}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {assetClassData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-md text-xs font-mono">
                          <p className="font-semibold text-slate-800">{data.name}</p>
                          <p className="text-slate-600">
                            {data.value}% · {formatINR(data.amount)}/mo
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">TOTAL</span>
              <span className="text-xs font-bold text-slate-900 font-mono">100%</span>
            </div>
          </div>

          {/* Asset Class Weight Stats */}
          <div className="flex-1 w-full space-y-2">
            {assetClassData.map((item) => (
              <div key={item.name} className="rounded-lg border border-slate-100 bg-slate-50/60 p-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-slate-800">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">{formatINR(item.amount)}/mo</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Target Weight</span>
                  <span>{item.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Detailed Recommended Investment Categories & Vehicles */}
      {categories.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs text-slate-500 font-medium">Specific Implementation</span>
              <h4 className="text-sm font-semibold text-slate-900">Where to Invest Your Money</h4>
            </div>
            <span className="text-xs font-mono text-slate-500">
              {categories.length} Recommended Categories
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {categories.map((cat: RecommendedVehicle) => {
              const riskColor =
                cat.risk_level === 'Low'
                  ? 'text-teal-700 bg-teal-50 border-teal-200'
                  : cat.risk_level === 'Moderate'
                  ? 'text-blue-700 bg-blue-50 border-blue-200'
                  : 'text-amber-700 bg-amber-50 border-amber-200';

              return (
                <div
                  key={cat.id || cat.category_name}
                  className="rounded-xl border border-slate-200 p-4 bg-white hover:border-slate-300 transition-colors space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color || '#3B82F6' }} />
                      <h5 className="text-xs font-bold text-slate-900">{cat.category_name}</h5>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                        {cat.asset_class}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${riskColor}`}>
                        {cat.risk_level} Risk
                      </span>
                      <div className="text-right font-mono">
                        <span className="text-xs font-bold text-slate-900">{formatINR(cat.amount_inr)}/mo</span>
                        <span className="text-[11px] text-slate-500 ml-1.5">({cat.percentage}%)</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {cat.rationale}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[11px]">
                    <div className="flex flex-wrap items-center gap-1.5 text-slate-600">
                      <span className="font-semibold text-slate-700">Suitable Instruments:</span>
                      {cat.suitable_instruments?.map((inst, i) => (
                        <span
                          key={i}
                          className="inline-block bg-slate-100/90 text-slate-700 px-2 py-0.5 rounded font-mono text-[10px]"
                        >
                          {inst}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 font-mono text-[10px]">
                      <Clock className="h-3 w-3 text-slate-400" />
                      <span>{cat.horizon_fit}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. AI Advisor Rationale (Gemini Private Backend Layer) */}
      <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 via-white to-slate-50 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">AI Advisor Strategy Narrative</h4>
              <span className="text-[10px] text-slate-500">
                {enhanced_by_ai ? 'Personalized AI analytical insight' : 'Rule-based analytical narrative'}
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-md bg-indigo-100/80 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 border border-indigo-200">
            <Sparkles className="h-2.5 w-2.5" />
            {enhanced_by_ai ? 'AI Enhanced' : 'Advisory Engine'}
          </span>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-slate-700">
          {explanation}
        </p>

        <div className="mt-3 pt-3 border-t border-indigo-100/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>Rooted in Model 5 risk classification & 6-month safety optimization rules</span>
          <span className="font-mono text-[10px]">All figures in INR (₹)</span>
        </div>
      </div>

      {/* 6. Regulatory & Safety Disclaimer */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-[11px] text-slate-600 leading-relaxed space-y-1">
        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
          <Info className="h-3.5 w-3.5 text-slate-500" />
          <span>Mandatory Educational & Regulatory Disclaimer</span>
        </div>
        <p>
          Investments are subject to market risks. FinTracker’s recommendations are estimates generated by custom machine learning models (Model 5: Random Forest Regressor) and rule-based asset allocation logic for educational guidance. They do not constitute certified financial advisory, and past performance does not guarantee future capital returns. Always evaluate personal tax implications and liquid emergencies prior to execution.
        </p>
      </div>
    </div>
  );
};
