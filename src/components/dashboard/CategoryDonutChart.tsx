import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatINR } from '../../utils/formatters';

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

const CATEGORY_DATA: CategoryData[] = [
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
  const totalExpense = CATEGORY_DATA.reduce((acc, cur) => acc + cur.value, 0);

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Donut Chart */}
        <div className="relative h-56 w-56 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={CATEGORY_DATA}
                innerRadius={62}
                outerRadius={88}
                paddingAngle={2}
                dataKey="value"
              >
                {CATEGORY_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as CategoryData;
                    const pct = ((data.value / totalExpense) * 100).toFixed(1);
                    return (
                      <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-md text-xs font-mono">
                        <p className="font-semibold text-slate-800">{data.name}</p>
                        <p className="text-slate-600 mt-0.5">
                          {formatINR(data.value)} ({pct}%)
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
          {CATEGORY_DATA.map((item) => {
            const pct = ((item.value / totalExpense) * 100).toFixed(0);
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
