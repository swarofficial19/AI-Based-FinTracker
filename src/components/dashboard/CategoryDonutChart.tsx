import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatINR } from '../../utils/formatters';
import { api } from '../../services/api';
import { Transaction } from '../../types';
import { PieChart as PieChartIcon, Loader2 } from 'lucide-react';

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Shopping: '#3B82F6',
  Travel: '#8B5CF6',
  Groceries: '#10B981',
  Transportation: '#F59E0B',
  'Bills & Utilities': '#EC4899',
  'Health & Fitness': '#06B6D4',
  Entertainment: '#6366F1',
  'Food & Dining': '#F97316',
  Subscriptions: '#14B8A6',
  Miscellaneous: '#64748B',
};

const DEMO_CATEGORY_DATA: CategoryData[] = [
  { name: 'Shopping', value: 6189, color: '#3B82F6' },
  { name: 'Travel', value: 5400, color: '#8B5CF6' },
  { name: 'Groceries', value: 3420, color: '#10B981' },
  { name: 'Transportation', value: 2950, color: '#F59E0B' },
  { name: 'Bills & Utilities', value: 2850, color: '#EC4899' },
  { name: 'Health & Fitness', value: 2870, color: '#06B6D4' },
  { name: 'Entertainment', value: 1250, color: '#6366F1' },
  { name: 'Food & Dining', value: 1100, color: '#F97316' },
  { name: 'Subscriptions', value: 649, color: '#14B8A6' },
  { name: 'Miscellaneous', value: 800, color: '#64748B' },
];

export const CategoryDonutChart: React.FC = () => {
  const [data, setData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [profile, txs] = await Promise.all([
          api.getProfile(),
          api.getTransactions(),
        ]);

        const isDemo =
          profile.id === 'usr_fintracker_demo' ||
          profile.email?.toLowerCase() === 'arjun.sharma@fintracker.ai';

        if (isDemo && txs.length === 0) {
          setData(DEMO_CATEGORY_DATA);
          return;
        }

        // Aggregate actual user expense transactions
        const expenseTxs = txs.filter((t) => t.type === 'expense');

        if (expenseTxs.length === 0) {
          if (isDemo) {
            setData(DEMO_CATEGORY_DATA);
          } else {
            setData([]);
          }
          return;
        }

        const catMap: Record<string, number> = {};
        for (const tx of expenseTxs) {
          const cat = tx.category || 'Miscellaneous';
          catMap[cat] = (catMap[cat] || 0) + tx.amount;
        }

        const aggregated: CategoryData[] = Object.entries(catMap)
          .map(([name, value]) => ({
            name,
            value: Math.round(value),
            color: CATEGORY_COLORS[name] || '#64748B',
          }))
          .sort((a, b) => b.value - a.value);

        setData(aggregated);
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const totalExpense = data.reduce((acc, cur) => acc + cur.value, 0);

  if (loading) {
    return (
      <div className="h-56 w-full flex items-center justify-center text-xs text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin mr-2 text-slate-400" />
        <span>Loading categories...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-56 w-full flex flex-col items-center justify-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-lg p-6">
        <PieChartIcon className="h-7 w-7 text-slate-300 mb-2" />
        <p className="font-semibold text-slate-700">No expense records yet</p>
        <p className="text-slate-400 mt-1 text-center">Add transactions to see category distribution.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Donut Chart */}
        <div className="relative h-56 w-56 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={62}
                outerRadius={88}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as CategoryData;
                    const pct = totalExpense > 0 ? ((item.value / totalExpense) * 100).toFixed(1) : '0';
                    return (
                      <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-md text-xs font-mono">
                        <p className="font-semibold text-slate-800">{item.name}</p>
                        <p className="text-slate-600 mt-0.5">
                          {formatINR(item.value)} ({pct}%)
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
            <span className="text-[10px] uppercase tracking-wider text-slate-600 font-medium">TOTAL</span>
            <span className="text-sm font-bold text-slate-900 font-mono tabular-nums">
              {formatINR(totalExpense)}
            </span>
          </div>
        </div>

        {/* Category Legend Grid */}
        <div className="flex-1 w-full grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
          {data.map((item) => {
            const pct = totalExpense > 0 ? ((item.value / totalExpense) * 100).toFixed(0) : '0';
            return (
              <div key={item.name} className="flex items-center justify-between py-1 border-b border-slate-50">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate text-slate-600">{item.name}</span>
                </div>
                <span className="font-mono tabular-nums text-slate-700 font-medium pl-1">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
