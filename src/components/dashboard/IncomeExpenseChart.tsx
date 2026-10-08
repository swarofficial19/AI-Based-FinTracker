import React, { useState } from 'react';
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

const DATA_6_MONTHS = [
  { month: 'May 26', income: 60000, expenses: 36200, savings: 23800 },
  { month: 'Jun 26', income: 62000, expenses: 39400, savings: 22600 },
  { month: 'Jul 26', income: 62000, expenses: 37800, savings: 24200 },
  { month: 'Aug 26', income: 77000, expenses: 40100, savings: 36900 }, // included freelance
  { month: 'Sep 26', income: 65000, expenses: 40050, savings: 24950 },
  { month: 'Oct 26', income: 65000, expenses: 38500, savings: 26500 },
];

const DATA_1_YEAR = [
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
  const data = range === '6m' ? DATA_6_MONTHS : DATA_1_YEAR;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs text-slate-500">Cash Flow Comparison</span>
        </div>
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
