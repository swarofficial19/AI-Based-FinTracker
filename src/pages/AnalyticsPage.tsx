import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '../components/common/Card';
import { formatINR } from '../utils/formatters';
import { TrendingUp, PieChart as PieIcon, BarChart2, ShieldAlert } from 'lucide-react';

const MONTHLY_ANALYTICS = [
  { month: 'May 26', income: 60000, expenses: 36200, savings: 23800, savingsRate: 39.7 },
  { month: 'Jun 26', income: 62000, expenses: 39400, savings: 22600, savingsRate: 36.5 },
  { month: 'Jul 26', income: 62000, expenses: 37800, savings: 24200, savingsRate: 39.0 },
  { month: 'Aug 26', income: 77000, expenses: 40100, savings: 36900, savingsRate: 47.9 },
  { month: 'Sep 26', income: 65000, expenses: 40050, savings: 24950, savingsRate: 38.4 },
  { month: 'Oct 26', income: 65000, expenses: 38500, savings: 26500, savingsRate: 40.7 },
];

const TOP_CATEGORIES = [
  { name: 'Shopping & E-Commerce', amount: 6189, pct: 16.1, count: 4 },
  { name: 'Travel & Aviation', amount: 5400, pct: 14.0, count: 1 },
  { name: 'Groceries & Provisions', amount: 3420, pct: 8.9, count: 3 },
  { name: 'Fuel & Transportation', amount: 2950, pct: 7.7, count: 3 },
  { name: 'Health & Wellness', amount: 2870, pct: 7.5, count: 2 },
  { name: 'Bills & Utilities', amount: 2850, pct: 7.4, count: 2 },
  { name: 'Entertainment & Leisure', amount: 1250, pct: 3.2, count: 1 },
  { name: 'Food & Dining Out', amount: 1100, pct: 2.9, count: 2 },
  { name: 'Software Subscriptions', amount: 649, pct: 1.7, count: 1 },
  { name: 'Miscellaneous Expenses', amount: 800, pct: 2.1, count: 1 },
];

export const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'6m' | '1y'>('6m');

  const avgIncome = 65166;
  const avgExpenses = 38675;
  const avgSavingsRate = 40.4;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Financial Analytics & Trends</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Consolidated cashflow analysis, historical savings rate velocity and category rankings
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 text-xs font-medium">
          <button
            onClick={() => setTimeRange('6m')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              timeRange === '6m' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Past 6 Months
          </button>
          <button
            onClick={() => setTimeRange('1y')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              timeRange === '1y' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Trailing 1 Year
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">6-Month Average Income</span>
          <p className="mt-2 text-2xl font-bold font-mono text-slate-900">{formatINR(avgIncome)}</p>
          <span className="text-xs text-emerald-600 font-medium mt-1 inline-block">+7.2% vs prior period</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">6-Month Average Burn</span>
          <p className="mt-2 text-2xl font-bold font-mono text-slate-900">{formatINR(avgExpenses)}</p>
          <span className="text-xs text-emerald-600 font-medium mt-1 inline-block">-2.1% expense containment</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Mean Savings Rate</span>
          <p className="mt-2 text-2xl font-bold font-mono text-emerald-600">{avgSavingsRate}%</p>
          <span className="text-xs text-slate-500 mt-1 inline-block">Benchmarked above standard 30% baseline</span>
        </div>
      </div>

      {/* Row 1: Savings Rate Progression */}
      <Card
        title="Monthly Savings Rate Velocity (%)"
        subtitle="Proportion of monthly inflow retained in liquid capital and reserves"
      >
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MONTHLY_ANALYTICS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#CBD5E1' }} tick={{ fill: '#64748B', fontSize: 11 }} />
              <YAxis domain={[25, 55]} tickLine={false} axisLine={{ stroke: '#CBD5E1' }} tick={{ fill: '#64748B', fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-md text-xs font-mono">
                        <p className="font-semibold text-slate-800">{item.month}</p>
                        <p className="text-emerald-600 font-bold mt-1">Savings Rate: {item.savingsRate}%</p>
                        <p className="text-slate-500 text-[11px]">Saved: {formatINR(item.savings)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line type="monotone" dataKey="savingsRate" stroke="#059669" strokeWidth={2.5} dot={{ r: 4, fill: '#059669' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Row 2: Top Spending Categories Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Card
            title="Category Expenditure Ranking"
            subtitle="Volume and percentage of total outflow by vertical"
          >
            <div className="space-y-3">
              {TOP_CATEGORIES.map((cat, idx) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800 flex items-center gap-2">
                      <span className="font-mono text-slate-400 w-4">{idx + 1}.</span>
                      {cat.name}
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatINR(cat.amount)}{' '}
                      <span className="font-normal text-slate-500 text-[11px]">({cat.pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-slate-800 h-2 rounded-full"
                      style={{ width: `${Math.min(100, cat.pct * 4)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <PieIcon className="h-4 w-4 text-emerald-600" />
              <h4 className="text-xs font-semibold text-slate-900">50 / 30 / 20 Budget Fit</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              FinTracker calculates your structural allocation against standard economic guidelines:
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                  <span>Needs (Target 50%)</span>
                  <span>46% ({formatINR(30000)})</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '46%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                  <span>Wants (Target 30%)</span>
                  <span>13% ({formatINR(8500)})</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '13%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                  <span>Savings (Target 20%)</span>
                  <span>41% ({formatINR(26500)})</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-slate-900 h-2 rounded-full" style={{ width: '41%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <ShieldAlert className="h-3.5 w-3.5 text-slate-500" />
              <span>Statistical Note</span>
            </div>
            <p className="leading-relaxed">
              Historical ledger variance demonstrates high discipline on discretionary shopping, with occasional bursts from travel bookings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
