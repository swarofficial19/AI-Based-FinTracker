import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatINR } from '../../utils/formatters';
import { api } from '../../services/api';
import { BarChart3, Loader2 } from 'lucide-react';

interface MonthlyCashflowPoint {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

const DATA_6_MONTHS: MonthlyCashflowPoint[] = [
  { month: 'May 26', income: 60000, expenses: 36200, savings: 23800 },
  { month: 'Jun 26', income: 62000, expenses: 39400, savings: 22600 },
  { month: 'Jul 26', income: 62000, expenses: 37800, savings: 24200 },
  { month: 'Aug 26', income: 77000, expenses: 40100, savings: 36900 }, // included freelance
  { month: 'Sep 26', income: 65000, expenses: 40050, savings: 24950 },
  { month: 'Oct 26', income: 65000, expenses: 38500, savings: 26500 },
];

const DATA_1_YEAR: MonthlyCashflowPoint[] = [
  { month: 'Nov 25', income: 58000, expenses: 35000, savings: 23000 },
  { month: 'Dec 25', income: 64000, expenses: 42000, savings: 22000 },
  { month: 'Jan 26', income: 58000, expenses: 34500, savings: 23500 },
  { month: 'Feb 26', income: 58000, expenses: 33800, savings: 24200 },
  { month: 'Mar 26', income: 60000, expenses: 36000, savings: 24000 },
  { month: 'Apr 26', income: 60000, expenses: 35500, savings: 24500 },
  ...DATA_6_MONTHS,
];

export const IncomeExpenseChart: React.FC = () => {
  const [range, setRange] = useState<'6m' | '1y'>('6m');
  const [userCashflow, setUserCashflow] = useState<MonthlyCashflowPoint[]>([]);
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

        if (!demoCheck) {
          if (txs.length === 0) {
            setUserCashflow([]);
            return;
          }

          // Group by month
          const monthMap: Record<string, { income: number; expenses: number }> = {};
          for (const tx of txs) {
            if (!tx.date) continue;
            const key = tx.date.slice(0, 7);
            if (!monthMap[key]) {
              monthMap[key] = { income: 0, expenses: 0 };
            }
            if (tx.type === 'income') {
              monthMap[key].income += tx.amount;
            } else if (tx.type === 'expense') {
              monthMap[key].expenses += tx.amount;
            }
          }

          const sortedKeys = Object.keys(monthMap).sort();
          const points: MonthlyCashflowPoint[] = sortedKeys.map((key) => {
            const [y, m] = key.split('-');
            const d = new Date(Number(y), Number(m) - 1, 1);
            const label = !isNaN(d.getTime())
              ? d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
              : key;
            const inc = monthMap[key].income;
            const exp = monthMap[key].expenses;
            return {
              month: label,
              income: Math.round(inc),
              expenses: Math.round(exp),
              savings: Math.max(0, Math.round(inc - exp)),
            };
          });

          setUserCashflow(points);
        }
      } catch {
        setIsDemo(false);
        setUserCashflow([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const data = isDemo
    ? range === '6m'
      ? DATA_6_MONTHS
      : DATA_1_YEAR
    : userCashflow;

  if (loading) {
    return (
      <div className="h-64 sm:h-72 w-full flex items-center justify-center text-xs text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin mr-2 text-slate-400" />
        <span>Loading cash flow metrics...</span>
      </div>
    );
  }

  if (!isDemo && data.length === 0) {
    return (
      <div className="h-64 sm:h-72 w-full flex flex-col items-center justify-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-lg p-6">
        <BarChart3 className="h-7 w-7 text-slate-300 mb-2" />
        <p className="font-semibold text-slate-700">No cash flow records yet</p>
        <p className="text-slate-400 mt-1 text-center">Add transactions to track monthly income, expenses, and savings.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs text-slate-500">Cash Flow Comparison</span>
        </div>
        {isDemo && (
          <div className="flex items-center rounded-lg bg-slate-100 p-0.5 text-xs font-medium">
            <button
              onClick={() => setRange('6m')}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                range === '6m' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              6 Months
            </button>
            <button
              onClick={() => setRange('1y')}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                range === '1y' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              1 Year
            </button>
          </div>
        )}
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
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
              tickFormatter={(v) => `₹${v / 1000}k`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-md text-xs font-mono">
                      <p className="font-semibold text-slate-800 mb-1.5">{label}</p>
                      {payload.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-4 py-0.5">
                          <span className="capitalize text-slate-500">{item.name}:</span>
                          <span className="font-semibold text-slate-900">
                            {formatINR(Number(item.value))}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', color: '#475569' }}
            />
            <Bar dataKey="income" name="Income" fill="#0F172A" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="expenses" name="Expenses" fill="#E11D48" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="savings" name="Savings" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
