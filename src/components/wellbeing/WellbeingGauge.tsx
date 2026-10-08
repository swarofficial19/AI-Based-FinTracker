import React from 'react';
import { FinancialWellbeingResponse, WellbeingCategory } from '../../types';
import { Info, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

interface WellbeingGaugeProps {
  data: FinancialWellbeingResponse;
}

const CATEGORIES: {
  key: WellbeingCategory;
  label: string;
  desc: string;
  color: string;
  activeBg: string;
  border: string;
}[] = [
  {
    key: 'Very Low',
    label: 'Very Low',
    desc: 'Severe financial vulnerability and frequent difficulty absorbing unexpected shocks.',
    color: 'text-rose-700',
    activeBg: 'bg-rose-50 border-rose-300 text-rose-900',
    border: 'border-rose-200',
  },
  {
    key: 'Low',
    label: 'Low',
    desc: 'High financial strain, limited liquidity buffer, and persistent economic stress.',
    color: 'text-orange-700',
    activeBg: 'bg-orange-50 border-orange-300 text-orange-900',
    border: 'border-orange-200',
  },
  {
    key: 'Medium Low',
    label: 'Medium Low',
    desc: 'Moderate financial strain with constrained margin to absorb routine financial shocks.',
    color: 'text-amber-700',
    activeBg: 'bg-amber-50 border-amber-300 text-amber-900',
    border: 'border-amber-200',
  },
  {
    key: 'Medium High',
    label: 'Medium High',
    desc: 'Emerging resilience, consistent bill clearance, and developing emergency reserves.',
    color: 'text-blue-700',
    activeBg: 'bg-blue-50 border-blue-300 text-blue-900',
    border: 'border-blue-200',
  },
  {
    key: 'High',
    label: 'High',
    desc: 'Strong financial resilience, disciplined savings habit, and confidence in long-term goals.',
    color: 'text-emerald-700',
    activeBg: 'bg-emerald-50 border-emerald-300 text-emerald-900',
    border: 'border-emerald-200',
  },
  {
    key: 'Very High',
    label: 'Very High',
    desc: 'Exceptional financial security and comprehensive capacity to absorb severe life events.',
    color: 'text-teal-700',
    activeBg: 'bg-teal-50 border-teal-300 text-teal-900',
    border: 'border-teal-200',
  },
];

export const WellbeingGauge: React.FC<WellbeingGaugeProps> = ({ data }) => {
  const { category, confidence, model } = data;

  const currentCategoryMeta = CATEGORIES.find((c) => c.key === category) || CATEGORIES[4];
  const activeIndex = CATEGORIES.findIndex((c) => c.key === category);

  return (
    <div className="space-y-6">
      {/* Primary Score Hero Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Model 3: {model}</span>
              <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                CFPB Survey Trained
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">Financial Well-Being Classification</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct multi-class output evaluated across 25 CFPB survey behavioral & demographic vectors
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border uppercase tracking-wider shadow-xs ${currentCategoryMeta.activeBg}`}
            >
              {category}
            </span>
          </div>
        </div>

        {/* Real ML Output Visual */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-1 flex flex-col items-center justify-center p-5 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
              PREDICTED CATEGORY
            </span>
            <div className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              {category}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Confidence: {(confidence * 100).toFixed(1)}%</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-2 font-mono">
              6-Class Random Forest Model
            </span>
          </div>

          <div className="md:col-span-2 space-y-4">
            {/* 6-Tier Visual Continuum Scale */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-2">
                <span>CFPB 6-Tier Well-Being Continuum</span>
                <span className="font-mono text-[11px] text-slate-500">
                  Tier {activeIndex >= 0 ? activeIndex + 1 : 1} of 6
                </span>
              </div>

              <div className="grid grid-cols-6 gap-1.5">
                {CATEGORIES.map((cat, idx) => {
                  const isCurrent = cat.key === category;
                  return (
                    <div key={cat.key} className="space-y-1">
                      <div
                        className={`h-3 rounded-sm transition-all duration-300 ${
                          isCurrent
                            ? 'bg-slate-900 ring-2 ring-emerald-500 ring-offset-1'
                            : idx < activeIndex
                            ? 'bg-slate-300'
                            : 'bg-slate-200/80'
                        }`}
                      />
                      <span
                        className={`block text-[10px] text-center truncate ${
                          isCurrent
                            ? 'font-bold text-slate-900'
                            : 'text-slate-400 font-normal'
                        }`}
                        title={cat.label}
                      >
                        {cat.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Diagnosis Description */}
            <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-200 text-xs text-slate-700 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span>Classification Assessment:</span>
              </div>
              <p className="leading-relaxed text-slate-600">
                {data.explanation || currentCategoryMeta.desc}
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Info className="h-3.5 w-3.5 shrink-0" />
              <span>
                Real ML output received from FastAPI endpoint <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">POST /api/ai/financial-wellbeing</code>.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Six Categories CFPB Interpretation Guide */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
          CFPB National Financial Well-Being Categories
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => {
            const isSelected = cat.key === category;
            return (
              <div
                key={cat.key}
                className={`rounded-xl border p-3.5 transition-all ${
                  isSelected
                    ? `${cat.activeBg} shadow-xs ring-1 ring-emerald-500/30`
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900">{cat.label}</span>
                  {isSelected && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {cat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
