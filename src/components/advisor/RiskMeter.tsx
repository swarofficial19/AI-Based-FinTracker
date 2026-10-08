import React from 'react';
import { Cpu, ShieldCheck, Gauge } from 'lucide-react';

interface RiskMeterProps {
  score: number; // 1.0 to 7.0
  category: 'Conservative' | 'Moderate' | 'Aggressive';
  model?: string;
  breakdown?: {
    capacity_score?: number;
    horizon_factor?: number;
    stability_factor?: number;
  };
}

export const RiskMeter: React.FC<RiskMeterProps> = ({
  score,
  category,
  model = 'Random Forest Regressor',
  breakdown,
}) => {
  // Clamp score between 1 and 7
  const clamped = Math.max(1, Math.min(7, score));
  // Convert 1..7 to percentage 0..100%
  const percentage = ((clamped - 1) / 6) * 100;

  const categoryBadge =
    category === 'Conservative'
      ? 'text-teal-700 bg-teal-50 border-teal-200'
      : category === 'Moderate'
      ? 'text-blue-700 bg-blue-50 border-blue-200'
      : 'text-amber-700 bg-amber-50 border-amber-200';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Cpu className="h-3.5 w-3.5 text-indigo-600" />
            <span>Model 5: {model}</span>
          </div>
          <h4 className="text-sm font-semibold text-slate-900 mt-0.5">Assessed Risk Tolerance Profile</h4>
        </div>
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${categoryBadge}`}>
          {category} Investor
        </span>
      </div>

      <div className="mt-4">
        {/* Metric display */}
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tracking-tight text-slate-900">
              {score.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ 7.00 Max Score</span>
          </div>
          <div className="text-right text-[11px] text-slate-500">
            <span>Mapping: </span>
            <span className="font-semibold text-slate-700">
              {score <= 2.5 ? '1–2 (Conservative)' : score <= 5.5 ? '3–5 (Moderate)' : '6–7 (Aggressive)'}
            </span>
          </div>
        </div>

        {/* Progress gauge track */}
        <div className="relative mt-3">
          <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-100">
            {/* Conservative Segment (1 to 2.5) */}
            <div className="w-[25%] bg-teal-400" title="Conservative (1.0 - 2.5)" />
            {/* Moderate Segment (2.5 to 5.5) */}
            <div className="w-[50%] bg-blue-400" title="Moderate (2.5 - 5.5)" />
            {/* Aggressive Segment (5.5 to 7.0) */}
            <div className="w-[25%] bg-amber-400" title="Aggressive (5.5 - 7.0)" />
          </div>

          {/* Indicator pin */}
          <div
            className="absolute -top-1 h-5 w-1.5 -translate-x-1/2 rounded-full bg-slate-900 shadow-md ring-2 ring-white transition-all duration-300"
            style={{ left: `${percentage}%` }}
          />
        </div>

        {/* Scale labels */}
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="text-left">
            <span className="block font-medium text-slate-700">1.0 – 2.0</span>
            <span className="text-[10px] text-slate-600 font-sans">Conservative</span>
          </div>
          <div className="text-center">
            <span className="block font-medium text-slate-700">3.0 – 5.0</span>
            <span className="text-[10px] text-slate-600 font-sans">Moderate</span>
          </div>
          <div className="text-right">
            <span className="block font-medium text-slate-700">6.0 – 7.0</span>
            <span className="text-[10px] text-slate-600 font-sans">Aggressive</span>
          </div>
        </div>

        {/* Breakdown factors if available */}
        {breakdown && (
          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Surplus Capacity</span>
              <span className="font-mono font-semibold text-slate-800">{breakdown.capacity_score ?? '—'}</span>
            </div>
            <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Horizon Factor</span>
              <span className="font-mono font-semibold text-slate-800">{breakdown.horizon_factor ? `${breakdown.horizon_factor} yrs` : '—'}</span>
            </div>
            <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Safety Stability</span>
              <span className="font-mono font-semibold text-slate-800">{breakdown.stability_factor ? `${breakdown.stability_factor}x` : '—'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
