import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';
import { formatINR } from '../../utils/formatters';
import { Sparkles, Info, AlertCircle, Loader2, Calendar } from 'lucide-react';
import { api, getApiBaseUrl } from '../../services/api';
import {
  getFourMostRecentCompleteMonths,
  MonthlySpendingSummary,
} from '../../utils/spendingHistory';
import { PredictSpendingResponse } from '../../types';

export interface SpendingTrendChartProps {
  customHistory?: MonthlySpendingSummary[];
  customPrediction?: PredictSpendingResponse | null;
  isLoading?: boolean;
  predictedMonthLabel?: string;
  showExplanationBanner?: boolean;
}

export const SpendingTrendChart: React.FC<SpendingTrendChartProps> = ({
  customHistory,
  customPrediction,
  isLoading: propLoading,
  predictedMonthLabel = 'Next Month (Predicted)',
  showExplanationBanner = true,
}) => {
  const [history, setHistory] = useState<MonthlySpendingSummary[]>([]);
  const [prediction, setPrediction] = useState<PredictSpendingResponse | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If controlled props provided, use them; otherwise fetch independently
  const isControlled = customHistory !== undefined;
  const activeHistory = isControlled ? customHistory : history;
  const activePrediction = isControlled ? customPrediction : prediction;
  const isOverallLoading = propLoading !== undefined ? propLoading : (isLoadingHistory || isLoadingPrediction);

  useEffect(() => {
    if (isControlled) return;

    async function loadSpendingData() {
      setIsLoadingHistory(true);
      setError(null);
      try {
        const txs = await api.getTransactions();
        const historyAnalysis = getFourMostRecentCompleteMonths(txs);
        setHistory(historyAnalysis.completeMonths);

        // Only call prediction endpoint if at least 4 complete months exist
        if (historyAnalysis.hasFourMonths) {
          setIsLoadingPrediction(true);
          try {
            const res = await api.predictSpending({
              monthly_spending: historyAnalysis.monthlySpendingArray,
            });
            setPrediction(res);
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Prediction request failed';
            setError(msg);
          } finally {
            setIsLoadingPrediction(false);
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load transaction history';
        setError(msg);
      } finally {
        setIsLoadingHistory(false);
      }
    }

    loadSpendingData();
  }, [isControlled]);

  const predictedValue =
    activePrediction?.predicted_next_month_spending ?? activePrediction?.predicted_spending;

  // Build chart points
  const chartPoints = activeHistory.map((item) => ({
    month: item.label,
    spending: item.totalSpending,
    isPredicted: false,
  }));

  if (predictedValue !== undefined && activeHistory.length >= 4) {
    chartPoints.push({
      month: predictedMonthLabel,
      spending: predictedValue,
      isPredicted: true,
    });
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Spending Trend & ML Forecast</span>
            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-200">
              Extra Trees Regressor
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-3 bg-slate-900 inline-block" />
            <span className="text-slate-600">Historical Actuals</span>
          </div>
          {predictedValue !== undefined && (
            <div className="flex items-center gap-1.5">
              <span className="h-0.5 w-3 border-t-2 border-dashed border-emerald-600 inline-block" />
              <span className="text-emerald-700 font-medium">Predicted (Next Month)</span>
            </div>
          )}
        </div>
      </div>

      {isOverallLoading ? (
        <div className="h-60 w-full flex items-center justify-center text-xs text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span>Aggregating monthly ledger history...</span>
        </div>
      ) : chartPoints.length > 0 ? (
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartPoints} margin={{ top: 12, right: 20, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={{ stroke: '#CBD5E1' }}
                tick={{ fill: '#64748B', fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={{ stroke: '#CBD5E1' }}
                tick={{ fill: '#64748B', fontSize: 11 }}
                tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-md text-xs font-mono">
                        <div className="flex items-center gap-1 font-semibold text-slate-800">
                          {item.month}
                          {item.isPredicted && (
                            <span className="text-[10px] text-emerald-600 font-sans font-normal">
                              (Extra Trees Prediction)
                            </span>
                          )}
                        </div>
                        <p className="mt-1 font-bold text-slate-900 text-sm">
                          {formatINR(item.spending)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="spending"
                stroke="#0F172A"
                strokeWidth={2}
                dot={{ r: 3.5, fill: '#0F172A' }}
                activeDot={{ r: 5 }}
              />
              {predictedValue !== undefined && (
                <ReferenceDot
                  x="Next Month (ML)"
                  y={predictedValue}
                  r={6}
                  fill="#059669"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-44 w-full flex flex-col items-center justify-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-lg p-4">
          <Calendar className="h-6 w-6 text-slate-400 mb-2" />
          <p className="font-semibold text-slate-700">No monthly spending records found</p>
          <p className="text-slate-400 mt-0.5">Add expense transactions to build historical data.</p>
        </div>
      )}

      {/* State A: User has fewer than 4 months of actual data */}
      {history.length < 4 && !isLoadingHistory && (
        <div className="mt-3 rounded-lg bg-amber-50/80 border border-amber-200 p-3 text-xs text-amber-900 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-amber-950">
              Minimum 4 Months Required for ML Prediction
            </span>
            <p className="text-amber-800 leading-relaxed">
              The Extra Trees Regressor requires at least 4 months of historical monthly spending data (currently{' '}
              <strong>{history.length} month(s)</strong> available in your ledger). Record transactions across at least 4 distinct months to run next-month prediction via FastAPI.
            </p>
          </div>
        </div>
      )}

      {/* State B: Loading FastAPI prediction */}
      {isLoadingPrediction && (
        <div className="mt-3 rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-xs text-slate-700 flex items-center gap-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-600" />
          <span>Calling FastAPI backend: POST /api/ai/predict-spending...</span>
        </div>
      )}

      {/* State C: FastAPI API Error */}
      {error && (
        <div className="mt-3 rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-800 flex items-start gap-2">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <span className="font-semibold">FastAPI Backend Connection Error: </span>
            <span>{error}</span>
            <p className="text-[11px] text-rose-600 mt-0.5 font-mono">
              Base URL: {getApiBaseUrl()}
            </p>
          </div>
        </div>
      )}

      {/* State D: Success Banner */}
      {showExplanationBanner && predictedValue !== undefined && !error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-emerald-50/70 border border-emerald-100 p-2.5 text-xs text-emerald-900">
          <Sparkles className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold text-emerald-950">Next Month Prediction: </span>
            <span className="font-mono font-bold text-emerald-800">
              {formatINR(predictedValue)}
            </span>
            <span className="text-emerald-700 ml-1">
              (Extra Trees Regressor · {prediction?.currency || 'INR'})
            </span>
            {prediction?.explanation && (
              <p className="mt-1 text-[11px] text-emerald-800/90 leading-relaxed font-sans">
                {prediction.explanation}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Informational Disclaimer */}
      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-600">
        <Info className="h-3 w-3 shrink-0" />
        <span>Predictions are estimates based on historical financial behavior and should not be treated as guaranteed outcomes.</span>
      </div>
    </div>
  );
};
