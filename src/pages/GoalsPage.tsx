import React, { useState, useEffect } from 'react';
import { Target, Plus, Trash2, Edit2, CheckCircle, Calendar, Sparkles, Loader2 } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import { Skeleton } from '../components/common/Skeleton';
import { api } from '../services/api';
import { FinancialGoal } from '../types';
import { formatINR, formatDate } from '../utils/formatters';

export const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('2027-12-31');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [category, setCategory] = useState('Asset');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchGoals = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getGoals();
      setGoals(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch financial goals';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleOpenAdd = () => {
    setEditingGoal(null);
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setMonthlyContribution('');
    setTargetDate('2027-12-31');
    setCategory('Asset');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal: FinancialGoal) => {
    setEditingGoal(goal);
    setName(goal.name);
    setTargetAmount(String(goal.targetAmount));
    setCurrentAmount(String(goal.currentAmount));
    setMonthlyContribution(String(goal.monthlyContribution));
    setTargetDate(goal.targetDate);
    setCategory(goal.category || 'Asset');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await api.deleteGoal(id);
    await fetchGoals();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const tAmount = parseFloat(targetAmount);
    const cAmount = parseFloat(currentAmount) || 0;
    const mContrib = parseFloat(monthlyContribution) || 0;

    if (!name.trim() || isNaN(tAmount) || tAmount <= 0) {
      setFormError('Please enter a valid goal name and target amount greater than zero.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingGoal) {
        await api.updateGoal(editingGoal.id, {
          name: name.trim(),
          targetAmount: tAmount,
          currentAmount: cAmount,
          targetDate,
          monthlyContribution: mContrib,
          category,
        });
      } else {
        await api.createGoal({
          name: name.trim(),
          targetAmount: tAmount,
          currentAmount: cAmount,
          targetDate,
          monthlyContribution: mContrib,
          category,
        });
      }
      setIsModalOpen(false);
      await fetchGoals();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Financial Goals & Milestones
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track capital allocation velocity toward strategic reserve and wealth benchmarks
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Goal Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 rounded-xl bg-white p-5 border border-slate-200">
              <Skeleton className="h-5 w-36 mb-3" />
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-xs text-rose-700">
          {error}
        </div>
      ) : goals.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500">
          <Target className="h-8 w-8 mx-auto mb-2 text-slate-400" />
          <p className="font-semibold text-slate-700">No active financial goals found.</p>
          <button
            onClick={handleOpenAdd}
            className="mt-3 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            + Create your first goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((g) => {
            const pct = Math.min(100, (g.currentAmount / g.targetAmount) * 100);
            const remaining = Math.max(0, g.targetAmount - g.currentAmount);
            const monthsRemaining =
              g.monthlyContribution > 0 ? Math.ceil(remaining / g.monthlyContribution) : null;

            return (
              <div
                key={g.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        {g.category || 'Asset'}
                      </span>
                      <h3 className="text-sm font-semibold text-slate-900 mt-0.5">{g.name}</h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(g)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded"
                        title="Edit goal"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(g.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Delete goal"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="mt-4 flex items-baseline justify-between font-mono">
                    <span className="text-xl font-bold text-slate-900">{formatINR(g.currentAmount)}</span>
                    <span className="text-xs text-slate-500">Target: {formatINR(g.targetAmount)}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2.5">
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span>{pct.toFixed(1)}% Completed</span>
                      <span>Remaining: {formatINR(remaining)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer metadata */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>Target: {formatDate(g.targetDate)}</span>
                  </div>

                  {monthsRemaining !== null && (
                    <span className="font-mono text-[11px] text-slate-700 font-medium">
                      ~{monthsRemaining} mos at {formatINR(g.monthlyContribution)}/mo
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Goal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGoal ? 'Edit Financial Goal' : 'Define New Financial Goal'}
        subtitle="Capital accumulation milestone"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">
              {formError}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Goal Title</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Emergency Reserve Fund (6x)"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Amount (₹)</label>
              <input
                type="number"
                min="1000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Saved (₹)</label>
              <input
                type="number"
                min="0"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Inflow (₹)</label>
              <input
                type="number"
                min="0"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
                required
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{editingGoal ? 'Update Goal' : 'Create Goal'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
