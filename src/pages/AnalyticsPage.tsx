import React, { useState, useEffect } from 'react';
import {
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
import { api } from '../services/api';
import { TrendingUp, PieChart as PieIcon, BarChart2, ShieldAlert } from 'lucide-react';

interface MonthlyAnalyticsPoint {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
}

interface CategoryRankItem {
  name: string;
  amount: number;
  pct: number;
  count: number;
}

const DEMO_MONTHLY_ANALYTICS: MonthlyAnalyticsPoint[] = [
  { month: 'May 26', income: 60000, expenses: 36200, savings: 23800, savingsRate: 39.7 },
  { month: 'Jun 26', income: 62000, expenses: 39400, savings: 22600, savingsRate: 36.5 },
  { month: 'Jul 26', income: 62000, expenses: 37800, savings: 24200, savingsRate: 39.0 },
  { month: 'Aug 26', income: 77000, expenses: 40100, savings: 36900, savingsRate: 47.9 },
  { month: 'Sep 26', income: 65000, expenses: 40050, savings: 24950, savingsRate: 38.4 },
  { month: 'Oct 26', income: 65000, expenses: 38500, savings: 26500, savingsRate: 40.7 },
];

const DEMO_TOP_CATEGORIES: CategoryRankItem[] = [
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
  const [monthlyData, setMonthlyData] = useState<MonthlyAnalyticsPoint[]>([]);
  const [topCategories, setTopCategories] = useState<CategoryRankItem[]>([]);
  const [avgIncome, setAvgIncome] = useState(0);
  const [avgExpenses, setAvgExpenses] = useState(0);
  const [avgSavingsRate, setAvgSavingsRate] = useState(0);
  const [needsTotal, setNeedsTotal] = useState(0);
  const [wantsTotal, setWantsTotal] = useState(0);
  const [savingsTotal, setSavingsTotal] = useState(0);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [profile, txs] = await Promise.all([
          api.getProfile(),
          api.getTransactions(),
        ]);

        const demoCheck =
          profile.id === 'usr_fintracker_demo' ||
          profile.email?.toLowerCase() === 'arjun.sharma@fintracker.ai';
        setIsDemo(demoCheck);

        if (demoCheck) {
          setMonthlyData(DEMO_MONTHLY_ANALYTICS);
          setTopCategories(DEMO_TOP_CATEGORIES);
          setAvgIncome(65166);
          setAvgExpenses(38675);
          setAvgSavingsRate(40.4);
          setNeedsTotal(30000);
          setWantsTotal(8500);
          setSavingsTotal(26500);
        } else {
          // New user
          if (txs.length === 0) {
            setMonthlyData([]);
            setTopCategories([]);
            setAvgIncome(0);
            setAvgExpenses(0);
            setAvgSavingsRate(0);
            setNeedsTotal(0);
            setWantsTotal(0);
            setSavingsTotal(0);
            return;
          }

          // Group by month
          const monthMap: Record<string, { income: number; expenses: number }> = {};
          const catMap: Record<string, { amount: number; count: number }> = {};
          let totalExpenseAll = 0;
          let needsSum = 0;
          let wantsSum = 0;

          for (const tx of txs) {
            if (tx.date) {
              const k = tx.date.slice(0, 7);
              if (!monthMap[k]) monthMap[k] = { income: 0, expenses: 0 };
              if (tx.type === 'income') monthMap[k].income += tx.amount;
              else if (tx.type === 'expense') monthMap[k].expenses += tx.amount;
            }

            if (tx.type === 'expense') {
              totalExpenseAll += tx.amount;
              const c = tx.category || 'Miscellaneous';
              if (!catMap[c]) catMap[c] = { amount: 0, count: 0 };
              catMap[c].amount += tx.amount;
              catMap[c].count += 1;

              // 50/30/20 category bucket classification
              if (['Groceries', 'Bills & Utilities', 'Health & Fitness', 'Transportation'].includes(c)) {
                needsSum += tx.amount;
              } else {
                wantsSum += tx.amount;
              }
            }
          }

          const sortedMonths = Object.keys(monthMap).sort();
          const points: MonthlyAnalyticsPoint[] = sortedMonths.map((key) => {
            const [y, m] = key.split('-');
            const d = new Date(Number(y), Number(m) - 1, 1);
            const label = !isNaN(d.getTime())
              ? d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
              : key;
            const inc = monthMap[key].income;
            const exp = monthMap[key].expenses;
            const sav = Math.max(0, inc - exp);
            const rate = inc > 0 ? Number(((sav / inc) * 100).toFixed(1)) : 0;
            return {
              month: label,
              income: Math.round(inc),
              expenses: Math.round(exp),
              savings: Math.round(sav),
              savingsRate: rate,
            };
          });

          setMonthlyData(points);

          const totalInc = points.reduce((acc, p) => acc + p.income, 0);
          const totalExp = points.reduce((acc, p) => acc + p.expenses, 0);
          const mCount = points.length || 1;
          const meanInc = Math.round(totalInc / mCount);
          const meanExp = Math.round(totalExp / mCount);
          const meanRate = meanInc > 0 ? Number((((meanInc - meanExp) / meanInc) * 100).toFixed(1)) : 0;

          setAvgIncome(meanInc);
          setAvgExpenses(meanExp);
          setAvgSavingsRate(Math.max(0, meanRate));

          const rankedCats: CategoryRankItem[] = Object.entries(catMap)
            .map(([name, val]) => ({
              name,
              amount: Math.round(val.amount),
              count: val.count,
              pct: totalExpenseAll > 0 ? Number(((val.amount / totalExpenseAll) * 100).toFixed(1)) : 0,
            }))
            .sort((a, b) => b.amount - a.amount);

          setTopCategories(rankedCats);
          setNeedsTotal(needsSum);
          setWantsTotal(wantsSum);
          setSavingsTotal(Math.max(0, totalInc - totalExp));
        }
      } catch {
        setIsDemo(false);
        setMonthlyData([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const totalBudgetFlow = needsTotal + wantsTotal + savingsTotal;
  const needsPct = totalBudgetFlow > 0 ? Math.round((needsTotal / totalBudgetFlow) * 100) : 0;
  const wantsPct = totalBudgetFlow > 0 ? Math.round((wantsTotal / totalBudgetFlow) * 100) : 0;
  const savingsPct = totalBudgetFlow > 0 ? Math.round((savingsTotal / totalBudgetFlow) * 100) : 0;

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

        {isDemo && (
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
        )}
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Average Monthly Inflow</span>
          <p className="mt-2 text-2xl font-bold font-mono text-slate-900">{formatINR(avgIncome)}</p>
          <span className="text-xs text-slate-500 font-medium mt-1 inline-block">
            {isDemo ? '+7.2% vs prior period' : 'Based on recorded income entries'}
          </span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Average Monthly Outflow</span>
          <p className="mt-2 text-2xl font-bold font-mono text-slate-900">{formatINR(avgExpenses)}</p>
          <span className="text-xs text-slate-500 font-medium mt-1 inline-block">
            {isDemo ? '-2.1% expense containment' : 'Based on recorded expenses'}
          </span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Mean Savings Rate</span>
          <p className="mt-2 text-2xl font-bold font-mono text-emerald-600">{avgSavingsRate}%</p>
          <span className="text-xs text-slate-500 mt-1 inline-block">
            {avgSavingsRate >= 20 ? 'Optimal rate above 20% benchmark' : 'Target recommended baseline: 20%'}
          </span>
        </div>
      </div>

      {/* Row 1: Savings Rate Progression */}
      <Card
        title="Monthly Savings Rate Velocity (%)"
        subtitle="Proportion of monthly inflow retained in liquid capital and reserves"
      >
        {!loading && monthlyData.length === 0 ? (
          <div className="h-64 w-full flex flex-col items-center justify-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-lg p-6">
            <TrendingUp className="h-7 w-7 text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">No monthly savings velocity records yet</p>
            <p className="text-slate-400 mt-1 text-center">Add income and expense transactions to view savings rate velocity.</p>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#CBD5E1' }} tick={{ fill: '#64748B', fontSize: 11 }} />
                <YAxis domain={[0, 60]} tickLine={false} axisLine={{ stroke: '#CBD5E1' }} tick={{ fill: '#64748B', fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as MonthlyAnalyticsPoint;
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
        )}
      </Card>

      {/* Row 2: Top Spending Categories Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Card
            title="Category Expenditure Ranking"
            subtitle="Volume and percentage of total outflow by vertical"
          >
            {!loading && topCategories.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                <BarChart2 className="h-7 w-7 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">No expense categories found</p>
                <p className="text-slate-400 mt-1">Expenses will appear here automatically ranked by volume as you log entries.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topCategories.map((cat, idx) => (
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
            )}
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
                  <span>{needsPct}% ({formatINR(needsTotal)})</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${needsPct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                  <span>Wants (Target 30%)</span>
                  <span>{wantsPct}% ({formatINR(wantsTotal)})</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${wantsPct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                  <span>Savings (Target 20%)</span>
                  <span>{savingsPct}% ({formatINR(savingsTotal)})</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-slate-900 h-2 rounded-full" style={{ width: `${savingsPct}%` }} />
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
              {topCategories.length === 0
                ? 'No transactions logged yet. Enter your expenses and income to calculate budgeting fit and category distributions.'
                : 'Historical ledger variance demonstrates disciplined resource management across essential and discretionary verticals.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
