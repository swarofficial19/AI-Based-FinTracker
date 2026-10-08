import React, { useState, useEffect } from 'react';
import { Transaction, ExpenseCategory, PaymentMethod, TransactionType } from '../../types';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';
import { Sparkles, Loader2, Check } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'userId'>, existingId?: string) => Promise<void>;
  editingTransaction?: Transaction | null;
}

const CATEGORIES: ExpenseCategory[] = [
  'Food & Dining',
  'Groceries',
  'Transportation',
  'Shopping',
  'Bills & Utilities',
  'Entertainment',
  'Health & Fitness',
  'Subscriptions',
  'Travel',
  'Miscellaneous',
];

const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI',
  'Credit Card',
  'Debit Card',
  'Net Banking',
  'Cash',
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<ExpenseCategory>('Groceries');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [notes, setNotes] = useState('');

  // AI Categorization states
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{
    category: ExpenseCategory;
    confidence: number;
    model: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingTransaction) {
      setDescription(editingTransaction.description);
      setAmount(String(editingTransaction.amount));
      setType(editingTransaction.type);
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setPaymentMethod(editingTransaction.paymentMethod);
      setNotes(editingTransaction.notes || '');
      setAiSuggestion(null);
    } else {
      setDescription('');
      setAmount('');
      setType('expense');
      setCategory('Food & Dining');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('UPI');
      setNotes('');
      setAiSuggestion(null);
    }
    setError(null);
  }, [editingTransaction, isOpen]);

  const handleAiCategorize = async () => {
    if (!description.trim()) {
      setError('Please enter a description first to auto-categorize.');
      return;
    }
    setError(null);
    setIsCategorizing(true);
    try {
      const res = await api.categorizeExpense({ description });
      setAiSuggestion(res);
      setCategory(res.category);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Categorization failed';
      setError(message);
    } finally {
      setIsCategorizing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!description.trim()) {
      setError('Description is required');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive amount in ₹');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(
        {
          description: description.trim(),
          amount: parsedAmount,
          type,
          category,
          date,
          paymentMethod,
          notes: notes.trim() || undefined,
          isAiCategorized: Boolean(aiSuggestion),
        },
        editingTransaction ? editingTransaction.id : undefined
      );
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save transaction';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTransaction ? 'Edit Transaction' : 'Record New Transaction'}
      subtitle="Financial Ledger Entry & ML Categorization"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Transaction Type Radio Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Transaction Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                type === 'expense'
                  ? 'border-rose-300 bg-rose-50/70 text-rose-900 font-semibold shadow-xs'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Expense (-)
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                type === 'income'
                  ? 'border-emerald-300 bg-emerald-50/70 text-emerald-900 font-semibold shadow-xs'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Income (+)
            </button>
          </div>
        </div>

        {/* Description + AI Auto-Categorize trigger */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">Description</label>
            {type === 'expense' && (
              <button
                type="button"
                onClick={handleAiCategorize}
                disabled={isCategorizing || !description.trim()}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200 transition-colors disabled:opacity-50"
              >
                {isCategorizing ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3" />
                    <span>Auto-categorize with AI</span>
                  </>
                )}
              </button>
            )}
          </div>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Swiggy dinner or Reliance Fresh grocery"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden"
            required
          />
        </div>

        {/* AI Suggested Category Callout */}
        {aiSuggestion && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900">
            <div className="flex items-center justify-between">
              <span className="font-semibold flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-700" />
                AI Suggested Category: {aiSuggestion.category}
              </span>
              <span className="text-[11px] font-mono text-emerald-700 font-semibold">
                Confidence: {(aiSuggestion.confidence * 100).toFixed(0)}%
              </span>
            </div>
            <p className="mt-1 text-[11px] text-emerald-700">
              Evaluated by Model 1 ({aiSuggestion.model}). You may accept or modify the selection below.
            </p>
          </div>
        )}

        {/* Amount & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (₹ INR)</label>
            <input
              type="number"
              step="any"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 1250"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-hidden bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date & Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-hidden bg-white"
            >
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Notes (Optional)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional context or remarks"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden"
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{editingTransaction ? 'Update Entry' : 'Save Transaction'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
