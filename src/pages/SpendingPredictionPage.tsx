import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Sliders,
  DollarSign,
  ShieldCheck,
  Info,
  ChevronRight,
  Database,
  BarChart2,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { SpendingTrendChart } from '../components/dashboard/SpendingTrendChart';
import { formatINR } from '../utils/formatters';
import { api } from '../services/api';
import {
  getFourMostRecentCompleteMonths,
  SpendingPredictionHistoryResult,
  MonthlySpendingSummary,
} from '../utils/spendingHistory';
import { PredictSpendingResponse, Transaction } from '../types';

export const SpendingPredictionPage: React.FC = () => {
  const [historyResult, setHistoryResult] = useState<SpendingPredictionHistoryResult | null>(null);
  const [prediction, setPrediction] = useState<PredictSpendingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPredicting, setIsPredicting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load transactions and calculate the 4-month history
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const txs = await api.getTransactions();
      const analysis = getFourMostRecentCompleteMonths(txs);
      setHistoryResult(analysis);

      // If at least 4 complete months exist, trigger prediction with Model 2
      if (analysis.hasFourMonths) {
        setIsPredicting(true);
        try {
          const res = await api.predictSpending({
            monthly_spending: analysis.monthlySpendingArray,
          });
          setPrediction(res);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Prediction request failed';
          setError(msg);
        } finally {
          setIsPredicting(false);
        }
      } else {
        setPrediction(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load transaction ledger';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Insert sample 4-month benchmark transactions if user has insufficient data
  const handleInsertSampleData = async () => {
    setIsLoading(true);
    setActionMessage(null);
    try {
      await api.insertSampleFourMonthTransactions();
      setActionMessage('Loaded 4-month complete transaction ledger (June, July, August, September).');
      await loadData();
    } catch {
      setError('Failed to insert sample transactions');
      setIsLoading(false);
    }
  };

  // Reset transactions back to default demo state
  const handleResetData = async () => {
    setIsLoading(true);
    setActionMessage(null);
    try {
      await api.resetTransactions();
      setActionMessage('Reset transaction ledger to default state.');
      await loadData();
    } catch {
      setError('Failed to reset transactions');
      setIsLoading(false);
    }
  };

  const hasFour = historyResult?.hasFourMonths ?? false;
  const completeMonths = historyResult?.completeMonths ?? [];
  const targetMonthLabel = historyResult?.targetPredictedMonthLabel ?? 'Upcoming Month';
  const predictedValue =
    prediction?.predicted_next_month_spending ?? prediction?.predicted_spending;

  // Compute 4-month statistics for analysis
  const averageHistorical =
    completeMonths.length > 0
      ? completeMonths.reduce((acc, m) => acc + m.totalSpending, 0) / completeMonths.length
      : 0;

  const lastMonthSpending =
    completeMonths.length > 0 ? completeMonths[completeMonths.length - 1].totalSpending : 0;

  const varianceVsAvg =
    predictedValue !== undefined && averageHistorical > 0
      ? ((predictedValue - averageHistorical) / averageHistorical) * 100
      : 0;

  const varianceVsLastMonth =
    predictedValue !== undefined && lastMonthSpending > 0
      ? ((predictedValue - lastMonthSpending) / lastMonthSpending) * 100
      : 0;

  const highestMonth =
    completeMonths.length > 0
      ? [...completeMonths].sort((a, b) => b.totalSpending - a.totalSpending)[0]
      : null;

  const lowestMonth =
    completeMonths.length > 0
      ? [...completeMonths].sort((a, b) => a.totalSpending - b.totalSpending)[0]
      : null;

  const dailyBurnCap = predictedValue !== undefined ? predictedValue / 30 : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono bg-slate-900 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                Model 2: Spending Prediction
              </span>
              <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                Extra Trees Regressor
              </span>
              <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                4-Month Sequential History Pipeline
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-2">
              Future Spending Prediction
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              FinTracker AI forecasts your expenditure for the upcoming month by feeding your four most recent complete months of transaction data into a custom Extra Trees Regressor.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={loadData}
              disabled={isLoading || isPredicting}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              title="Refresh ledger and re-run prediction"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading || isPredicting ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleInsertSampleData}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50 shadow-xs"
            >
              <Database className="h-3.5 w-3.5 text-emerald-400" />
              <span>Insert 4-Month Sample Data</span>
            </button>
          </div>
        </div>

        {/* Action / Success Banner */}
        {actionMessage && (
          <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{actionMessage}</span>
            </div>
            <button
              onClick={() => setActionMessage(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 text-xs"
            >
              ×
            </button>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mt-3 rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* 4-Month Minimum Requirement State */}
      {!hasFour && !isLoading && historyResult && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-sm font-bold text-amber-950">
                Spending prediction becomes available after 4 complete months of transaction history.
              </h3>
              <p className="text-xs text-amber-900 leading-relaxed">
                You currently have <strong>{historyResult.availableMonthsCount} complete month(s)</strong> of spending history in your ledger. Add transactions for{' '}
                <strong>{historyResult.missingMonthsCount} more complete month(s)</strong> to unlock Spending Prediction with Model 2.
              </p>

              {historyResult.currentIncompleteMonth && (
                <div className="text-[11px] text-amber-800 bg-amber-100/70 p-2 rounded-md font-mono">
                  Note: The current month (<strong>{historyResult.currentIncompleteMonth.fullMonthName}</strong>) is ongoing with ₹{historyResult.currentIncompleteMonth.spendingSoFar.toLocaleString('en-IN')} recorded so far. Under model requirements, incomplete months are excluded from the historical regression features.
                </div>
              )}

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleInsertSampleData}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-amber-800 shadow-xs"
                >
                  <Database className="h-3.5 w-3.5 text-amber-300" />
                  <span>Insert 4-Month Sample Transactions (June – Sept)</span>
                </button>
                <button
                  onClick={handleResetData}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-50"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-amber-700" />
                  <span>Reset Ledger to Default</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Prediction & Metrics Section (When 4 months available) */}
      {hasFour && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hero Prediction Card */}
          <div className="lg:col-span-1 rounded-xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                  Model 2 Output
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-mono font-medium text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  Calibrated
                </span>
              </div>

              <div className="mt-3">
                <span className="text-xs text-slate-500 font-medium block">
                  Predicted Next-Month Spending
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 block mt-0.5">
                  Target: {targetMonthLabel}
                </span>

                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                    {predictedValue !== undefined ? formatINR(predictedValue) : 'Computing...'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-600 font-mono mt-1 block">
                  Model: {prediction?.model || 'Extra Trees Regressor (Model 2)'}
                </span>
              </div>

              {/* Metric Badges */}
              <div className="mt-5 space-y-2.5 pt-4 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">4-Month Mean:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {formatINR(averageHistorical)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Variance vs 4-Mo Avg:</span>
                  <span
                    className={`font-mono font-bold flex items-center gap-0.5 ${
                      varianceVsAvg > 0 ? 'text-amber-600' : 'text-emerald-600'
                    }`}
                  >
                    {varianceVsAvg > 0 ? (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5" />
                    )}
                    {varianceVsAvg > 0 ? '+' : ''}
                    {varianceVsAvg.toFixed(2)}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Momentum vs Last Month:</span>
                  <span
                    className={`font-mono font-bold flex items-center gap-0.5 ${
                      varianceVsLastMonth > 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {varianceVsLastMonth > 0 ? (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5" />
                    )}
                    {varianceVsLastMonth > 0 ? '+' : ''}
                    {varianceVsLastMonth.toFixed(2)}%
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-500">Suggested Daily Run-Rate:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatINR(dailyBurnCap)} / day
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
              <span>Currency: INR (₹)</span>
              <span>4 Complete Months Fed</span>
            </div>
          </div>

          {/* Spending Trend Chart (Reusing component) */}
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="mb-2">
              <h3 className="text-sm font-bold text-slate-900">
                Spending Trend & Forecast Visualization
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Sequential spending progression across the 4 complete months and the Extra Trees projected point.
              </p>
            </div>

            <SpendingTrendChart
              customHistory={completeMonths}
              customPrediction={prediction}
              isLoading={isLoading || isPredicting}
              predictedMonthLabel={`Predicted ${targetMonthLabel}`}
              showExplanationBanner={false}
            />
          </div>
        </div>
      )}

      {/* Historical 4-Month Spending Breakdown Display */}
      {hasFour && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-600" />
                <span>Historical 4-Month Spending Data Used by Model 2</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Exact monthly aggregates chronologically supplied to the regression pipeline (Oldest → Newest).
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
              Input Vector: [{completeMonths.map((m) => `₹${m.totalSpending.toLocaleString('en-IN')}`).join(', ')}]
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {completeMonths.map((m, idx) => (
              <div
                key={m.monthKey}
                className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{m.fullMonthName}</span>
                  <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">
                    Month {idx + 1}
                  </span>
                </div>
                <div className="text-lg font-bold font-mono text-slate-900">
                  {formatINR(m.totalSpending)}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center justify-between">
                  <span>{m.transactionCount} entries</span>
                  {idx > 0 && (
                    <span
                      className={`font-mono text-[10px] ${
                        m.totalSpending >= completeMonths[idx - 1].totalSpending
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {m.totalSpending >= completeMonths[idx - 1].totalSpending ? '+' : ''}
                      {(
                        ((m.totalSpending - completeMonths[idx - 1].totalSpending) /
                          completeMonths[idx - 1].totalSpending) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Target Predicted Month Card */}
            <div className="rounded-lg border-2 border-dashed border-emerald-300 bg-emerald-50/50 p-3.5 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-950">{targetMonthLabel}</span>
                <span className="text-[10px] font-mono bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold">
                  Target
                </span>
              </div>
              <div className="text-lg font-bold font-mono text-emerald-800">
                {predictedValue !== undefined ? formatINR(predictedValue) : '...'}
              </div>
              <div className="text-[11px] text-emerald-700 font-medium">
                Model 2 Projection
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytical Insights & Explanation Section */}
      {hasFour && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AI Explanation Card */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-slate-800" />
                <span className="font-bold text-slate-900 text-sm">
                  FinTracker AI Spending Insights
                </span>
              </div>
            }
            subtitle="Analytical breakdown of trajectory, overspending risk, and recommended budget controls"
          >
            <div className="space-y-4">
              {prediction?.explanation ? (
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-xs leading-relaxed text-slate-800 space-y-2">
                  <div className="whitespace-pre-line font-sans">
                    {prediction.explanation}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-slate-50 p-4 text-xs text-slate-600">
                  Based on your sequential 4-month spending records, the Extra Trees Regressor projects next month's total expenditure at {predictedValue !== undefined ? formatINR(predictedValue) : ''}.
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-md border border-slate-100 bg-white p-3 space-y-1">
                  <span className="text-slate-500 font-medium block text-[11px]">Peak Spending Month</span>
                  <span className="font-bold text-slate-900">
                    {highestMonth ? `${highestMonth.fullMonthName} (${formatINR(highestMonth.totalSpending)})` : 'N/A'}
                  </span>
                </div>
                <div className="rounded-md border border-slate-100 bg-white p-3 space-y-1">
                  <span className="text-slate-500 font-medium block text-[11px]">Lowest Spending Month</span>
                  <span className="font-bold text-slate-900">
                    {lowestMonth ? `${lowestMonth.fullMonthName} (${formatINR(lowestMonth.totalSpending)})` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Actionable Budget Guardrails */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-700" />
                <span className="font-bold text-slate-900 text-sm">
                  Actionable Spending Guardrails
                </span>
              </div>
            }
            subtitle="Rule-based financial controls aligned with your ₹65,000 monthly income"
          >
            <div className="space-y-3 text-xs">
              <div className="rounded-lg border border-slate-200 bg-white p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">1. Maximum Suggested Monthly Cap</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatINR(predictedValue !== undefined ? Math.ceil(predictedValue / 500) * 500 : 40000)}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Setting your spending ceiling slightly above the Model 2 estimate protects your ₹26,500 monthly savings surplus from discretionary drift.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">2. Discretionary Spending Ceiling</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatINR(12000)}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Historical spikes were driven primarily by Shopping (festive items) and Travel bookings. Capping dining and shopping at ₹12,000 ensures essential utilities remain unhindered.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">3. Daily Expenditure Runway</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatINR(dailyBurnCap)} / day
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Pacing everyday expenses below ₹{Math.round(dailyBurnCap).toLocaleString('en-IN')} per day keeps you on track without requiring end-of-month emergency cuts.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Model 2 Technical Pipeline & Architecture Specifications */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-5 text-xs text-slate-600 space-y-3">
        <div className="flex items-center gap-2 font-semibold text-slate-800">
          <Layers className="h-4 w-4 text-slate-700" />
          <span>Machine Learning Pipeline Details · Model 2 Architecture</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 text-[11px]">
          <div>
            <span className="font-bold text-slate-700 block mb-0.5">Algorithm & Training:</span>
            <span>Extra Trees Regressor (Extremely Randomized Trees) implemented in Python scikit-learn. Randomized decision splits minimize model variance across sequential financial series.</span>
          </div>
          <div>
            <span className="font-bold text-slate-700 block mb-0.5">Feature Engineering:</span>
            <span>Extracts lag-1, lag-2, lag-3, and lag-4 expenditure features, 4-month rolling mean, momentum differential, and variance across consecutive periods.</span>
          </div>
          <div>
            <span className="font-bold text-slate-700 block mb-0.5">API Contract & Integrity:</span>
            <span>Endpoint: <code className="bg-white px-1 py-0.5 rounded border border-slate-200 text-slate-800 font-mono">POST /api/ai/predict-spending</code>. Numerical values are computed strictly by the ML regression model.</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-200/80 flex items-center gap-1.5 text-[11px] text-slate-500">
          <Info className="h-3.5 w-3.5 shrink-0" />
          <span>Educational Disclaimer: Predictions are estimates generated by FinTracker AI's analytical machine learning models based on past financial patterns. They do not constitute guaranteed financial returns or certified investment advice.</span>
        </div>
      </div>
    </div>
  );
};
