import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

interface MetricCardProps {
  label: string;
  value: number;
  changePct: number;
  comparisonLabel?: string;
  icon: React.FC<{ className?: string }>;
  isExpense?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  changePct,
  comparisonLabel = 'vs last month',
  icon: Icon,
  isExpense = false,
}) => {
  // For expenses, a decrease is positive (favorable)
  const isZero = changePct === 0;
  const isPositiveDirection = isExpense ? changePct < 0 : changePct > 0;
  const absPct = Math.abs(changePct).toFixed(1);

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700">{label}</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
          {formatINR(value)}
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <span
            className={`inline-flex items-center font-medium font-mono tabular-nums ${
              isZero
                ? 'text-slate-500 font-normal'
                : isPositiveDirection
                ? 'text-emerald-800 font-semibold'
                : 'text-rose-800 font-semibold'
            }`}
          >
            {!isZero && (changePct > 0 ? (
              <TrendingUp className="mr-0.5 h-3.5 w-3.5 inline" />
            ) : (
              <TrendingDown className="mr-0.5 h-3.5 w-3.5 inline" />
            ))}
            {isZero ? '0.0%' : changePct > 0 ? `+${absPct}%` : `-${absPct}%`}
          </span>
          <span className="text-slate-600 font-normal">·</span>
          <span className="text-slate-600">{isZero ? 'no previous data' : comparisonLabel}</span>
        </div>
      </div>
    </div>
  );
};
