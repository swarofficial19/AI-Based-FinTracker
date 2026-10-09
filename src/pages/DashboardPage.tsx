import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  ArrowRight,
  Receipt,
} from 'lucide-react';
import { MetricCard } from '../components/dashboard/MetricCard';
import { IncomeExpenseChart } from '../components/dashboard/IncomeExpenseChart';
import { CategoryDonutChart } from '../components/dashboard/CategoryDonutChart';
import { SpendingTrendChart } from '../components/dashboard/SpendingTrendChart';
import { Card } from '../components/common/Card';
import { Skeleton } from '../components/common/Skeleton';
import { api } from '../services/api';
import { DashboardMetrics, Transaction } from '../types';
import { formatINR, formatDate } from '../utils/formatters';
import { NavTab } from '../components/layout/Sidebar';

interface DashboardPageProps {
  setActiveTab: (tab: NavTab) => void;
  onOpenAddTx: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  setActiveTab,
  onOpenAddTx,
}) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [dashRes, txRes] = await Promise.all([
          api.getDashboard(),
          api.getTransactions(),
        ]);
        setMetrics(dashRes);
        setRecentTx(txRes.slice(0, 6));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load dashboard metrics';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-white p-5 border border-slate-200">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-32" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 rounded-xl bg-white p-5 border border-slate-200">
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-60 w-full" />
          </div>
          <div className="h-80 rounded-xl bg-white p-5 border border-slate-200">
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-60 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-6 text-center">
        <p className="text-sm font-semibold text-rose-800">
          {error || 'Unable to load dashboard records'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 px-4 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 4 Primary Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Balance"
          value={metrics.totalBalance}
          changePct={metrics.balanceChangePct}
          comparisonLabel="vs last month"
          icon={Wallet}
        />
        <MetricCard
          label="Monthly Income"
          value={metrics.monthlyIncome}
          changePct={metrics.incomeChangePct}
          comparisonLabel="vs last month"
          icon={ArrowDownLeft}
        />
        <MetricCard
          label="Monthly Expenses"
          value={metrics.monthlyExpenses}
          changePct={metrics.expenseChangePct}
          comparisonLabel="vs last month"
          icon={ArrowUpRight}
          isExpense
        />
        <MetricCard
          label="Monthly Savings"
          value={metrics.monthlySavings}
          changePct={metrics.savingsChangePct}
          comparisonLabel="vs last month"
          icon={PiggyBank}
        />
      </div>

      {/* Charts Grid: Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <Card
            title="Monthly Income vs Expenses"
            subtitle="Historical cash inflow and outflow performance"
          >
            <IncomeExpenseChart />
          </Card>
        </div>

        <div className="lg:col-span-5">
          <Card
            title="Expense Category Breakdown"
            subtitle="Current month distribution across 10 spending verticals"
          >
            <CategoryDonutChart />
          </Card>
        </div>
      </div>

      {/* Charts Grid: Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <Card
            title="Spending Velocity & ML Projection"
            subtitle="Extra Trees Regressor monthly trend forecast"
            action={
              <button
                onClick={() => setActiveTab('spending-prediction')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium"
              >
                Full Prediction Tab →
              </button>
            }
          >
            <SpendingTrendChart />
          </Card>
        </div>

        <div className="lg:col-span-6">
          <Card
            title="Recent Ledger Transactions"
            subtitle="Latest financial movements with payment tags"
            action={
              <button
                onClick={() => setActiveTab('transactions')}
                className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            }
          >
            <div className="divide-y divide-slate-100 -mx-1">
              {recentTx.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  <Receipt className="h-6 w-6 mx-auto mb-2 text-slate-400" />
                  No transactions recorded yet.
                </div>
              ) : (
                recentTx.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-2.5 px-2 hover:bg-slate-50/80 rounded-md transition-colors"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-xs font-semibold text-slate-900">
                          {tx.description}
                        </p>
                        {tx.isAiCategorized && (
                          <span
                            title="Auto-categorized by Model 1"
                            className="inline-flex text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200"
                          >
                            AI
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500">
                        <span>{tx.category}</span>
                        <span>·</span>
                        <span>{formatDate(tx.date)}</span>
                        <span>·</span>
                        <span className="font-mono text-slate-600">{tx.paymentMethod}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-bold font-mono tabular-nums ${
                          tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatINR(tx.amount)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Need to record a new bill or receipt?</span>
              <button
                onClick={onOpenAddTx}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                + Add Transaction
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
