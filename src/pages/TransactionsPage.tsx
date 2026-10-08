import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  ArrowUpDown,
  Sparkles,
  Receipt,
  Download,
} from 'lucide-react';
import { api } from '../services/api';
import { Transaction, ExpenseCategory, TransactionType } from '../types';
import { formatINR, formatDate } from '../utils/formatters';
import { Card } from '../components/common/Card';
import { Skeleton } from '../components/common/Skeleton';
import { TransactionModal } from '../components/transactions/TransactionModal';

const CATEGORIES: ('All' | ExpenseCategory)[] = [
  'All',
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

interface TransactionsPageProps {
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  isAddModalOpen,
  setIsAddModalOpen,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter & Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ExpenseCategory>('All');
  const [selectedType, setSelectedType] = useState<'all' | TransactionType>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Editing state
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTransactions();
      setTransactions(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load ledger transactions';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSaveTransaction = async (
    txData: Omit<Transaction, 'id' | 'userId'>,
    existingId?: string
  ) => {
    if (existingId) {
      await api.updateTransaction(existingId, txData);
    } else {
      await api.createTransaction(txData);
    }
    await fetchTransactions();
    setEditingTx(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction entry?')) {
      await api.deleteTransaction(id);
      await fetchTransactions();
    }
  };

  // Filtered & Sorted list
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        const matchesSearch =
          tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (tx.notes && tx.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
          tx.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
          selectedCategory === 'All' || tx.category === selectedCategory;
        const matchesType = selectedType === 'all' || tx.type === selectedType;
        return matchesSearch && matchesCategory && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, searchQuery, selectedCategory, selectedType, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage]);

  const exportCSV = () => {
    const headers = ['ID,Description,Amount,Type,Category,Date,Payment Method,Notes\n'];
    const rows = filteredTransactions.map((t) =>
      `"${t.id}","${t.description.replace(/"/g, '""')}",${t.amount},"${t.type}","${t.category}","${t.date}","${t.paymentMethod}","${(t.notes || '').replace(/"/g, '""')}"\n`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fintracker-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Ledger & Transaction Logs</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Historical double-entry records with integrated TF-IDF ML auto-categorization
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Card */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search box */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search description, payment, note..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-hidden"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value as any);
                setCurrentPage(1);
              }}
              aria-label="Filter by Category"
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 bg-white focus:border-slate-900 focus:outline-hidden"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  Category: {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Type Selector */}
          <div className="md:col-span-2">
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value as any);
                setCurrentPage(1);
              }}
              aria-label="Filter by Transaction Type"
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 bg-white focus:border-slate-900 focus:outline-hidden"
            >
              <option value="all">Type: All</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort Transactions By"
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 bg-white focus:border-slate-900 focus:outline-hidden font-mono"
            >
              <option value="date-desc">Date (Newest)</option>
              <option value="date-asc">Date (Oldest)</option>
              <option value="amount-desc">Amount (Highest)</option>
              <option value="amount-asc">Amount (Lowest)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card>
        {loading ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-8 text-center text-xs text-rose-600">{error}</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            <Receipt className="h-8 w-8 mx-auto mb-2 text-slate-400" />
            <p className="font-semibold text-slate-700">No matching transactions found</p>
            <p className="text-slate-400 mt-1">Try adjusting your search query or filter tags.</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-600 tracking-wider">
                  <th className="py-3 px-5">DATE</th>
                  <th className="py-3 px-4">DESCRIPTION</th>
                  <th className="py-3 px-4">CATEGORY</th>
                  <th className="py-3 px-4">METHOD</th>
                  <th className="py-3 px-4 text-right">AMOUNT (₹)</th>
                  <th className="py-3 px-5 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-3 px-5 font-mono text-slate-500 whitespace-nowrap">
                      {formatDate(tx.date)}
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-900 truncate">
                          {tx.description}
                        </span>
                        {tx.isAiCategorized && (
                          <span
                            title="Auto-categorized by TF-IDF + Logistic Regression Model"
                            className="inline-flex items-center gap-0.5 text-[10px] text-emerald-800 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200 shrink-0"
                          >
                            <Sparkles className="h-2.5 w-2.5" />
                            ML
                          </span>
                        )}
                      </div>
                      {tx.notes && (
                        <p className="text-[11px] text-slate-600 truncate mt-0.5">
                          {tx.notes}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {tx.category}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {tx.paymentMethod}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap tabular-nums">
                      <span
                        className={tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatINR(tx.amount)}
                      </span>
                    </td>

                    <td className="py-3 px-5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditingTx(tx)}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                          title="Edit transaction"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {!loading && filteredTransactions.length > 0 && (
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
            <div>
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredTransactions.length)} of{' '}
              {filteredTransactions.length} entries
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 font-mono text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal for Add or Edit */}
      <TransactionModal
        isOpen={isAddModalOpen || Boolean(editingTx)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTx(null);
        }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTx}
      />
    </div>
  );
};
