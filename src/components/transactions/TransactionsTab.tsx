import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, CategoryId } from '../../types/finance';
import { formatINR } from '../../utils/formatters';
import { CATEGORIES, CATEGORY_LIST } from '../../data/categories';
import { CategoryIcon } from '../common/CategoryIcon';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface TransactionsTabProps {
  onOpenAddModal: () => void;
  onOpenEditModal: (tx: Transaction) => void;
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({
  onOpenAddModal,
  onOpenEditModal,
}) => {
  const { state, metrics, deleteTransaction } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'expense' | 'income'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'day_desc' | 'day_asc' | 'amount_desc' | 'amount_asc'>('day_desc');
  const [deleteCandidate, setDeleteCandidate] = useState<Transaction | null>(null);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    return state.transactions
      .filter((tx) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = tx.title.toLowerCase().includes(q);
          const matchNotes = tx.notes ? tx.notes.toLowerCase().includes(q) : false;
          if (!matchTitle && !matchNotes) return false;
        }
        // Type filter
        if (selectedType !== 'all' && tx.type !== selectedType) {
          return false;
        }
        // Category filter
        if (selectedCategory !== 'all' && tx.category !== selectedCategory) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'day_desc') {
          return b.cycleDay !== a.cycleDay ? b.cycleDay - a.cycleDay : b.id.localeCompare(a.id);
        }
        if (sortBy === 'day_asc') {
          return a.cycleDay !== b.cycleDay ? a.cycleDay - b.cycleDay : a.id.localeCompare(b.id);
        }
        if (sortBy === 'amount_desc') {
          return b.amount - a.amount;
        }
        if (sortBy === 'amount_asc') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [state.transactions, searchQuery, selectedType, selectedCategory, sortBy]);

  const confirmDelete = () => {
    if (deleteCandidate) {
      deleteTransaction(deleteCandidate.id);
      setDeleteCandidate(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Transactions</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Real-time ledger connected to your cash balance and daily safe allowance.
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#C7FF4A] hover:bg-[#b5ee3a] text-black font-bold text-xs sm:text-sm rounded-lg transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C7FF4A] focus:ring-offset-2 focus:ring-offset-[#0B0D0C]"
          aria-label="Add new transaction"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
          <span>Record Transaction</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-[#141816] border border-[#222925] rounded-xl">
          <div className="text-xs text-zinc-400 font-medium">Total Expenses Paid</div>
          <div className="mt-1 text-2xl font-bold font-mono-num text-rose-400">
            {formatINR(metrics.totalExpenses)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Across 30-day budget cycle</div>
        </div>

        <div className="p-4 bg-[#141816] border border-[#222925] rounded-xl">
          <div className="text-xs text-zinc-400 font-medium">Extra Income Received</div>
          <div className="mt-1 text-2xl font-bold font-mono-num text-[#C7FF4A]">
            {formatINR(metrics.totalIncome)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Beyond initial ₹10,000 budget</div>
        </div>

        <div className="p-4 bg-[#141816] border border-[#222925] rounded-xl">
          <div className="text-xs text-zinc-400 font-medium">Remaining Cash in Hand</div>
          <div className="mt-1 text-2xl font-bold font-mono-num text-white">
            {formatINR(metrics.currentCashBalance)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Safe to spend: <span className="text-[#C7FF4A]">{formatINR(metrics.safeToSpendPerDay)}/day</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-[#141816] border border-[#222925] rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by merchant, title, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#0B0D0C] border border-[#222925] focus:border-[#C7FF4A] rounded-lg text-xs text-white placeholder:text-zinc-600 outline-none"
            />
          </div>

          {/* Type Segmented Buttons */}
          <div className="flex items-center gap-1 p-1 bg-[#0B0D0C] border border-[#222925] rounded-lg shrink-0">
            {(['all', 'expense', 'income'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-colors ${
                  selectedType === t
                    ? 'bg-[#141816] text-[#C7FF4A] border border-[#222925]'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t === 'all' ? 'All Types' : t}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-[#0B0D0C] border border-[#222925] text-xs text-zinc-300 rounded-lg outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {CATEGORY_LIST.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-[#0B0D0C] border border-[#222925] text-xs text-zinc-300 rounded-lg outline-none cursor-pointer font-mono-num"
          >
            <option value="day_desc">Latest Day First</option>
            <option value="day_asc">Earliest Day First</option>
            <option value="amount_desc">Highest Amount</option>
            <option value="amount_asc">Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-[#141816] border border-[#222925] rounded-xl overflow-hidden">
        {filteredTransactions.length > 0 ? (
          <div className="divide-y divide-[#222925]">
            {filteredTransactions.map((tx) => {
              const isExpense = tx.type === 'expense';
              const catMeta = CATEGORIES[tx.category] || CATEGORIES.other;

              return (
                <div
                  key={tx.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#191E1B]/50 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-[#222925]"
                      style={{ backgroundColor: `${catMeta.color}15` }}
                    >
                      <CategoryIcon
                        name={tx.category}
                        className="w-5 h-5"
                        style={{ color: catMeta.color }}
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-100">{tx.title}</span>
                        {tx.fromScenario && (
                          <span className="text-[10px] font-mono-num text-[#C7FF4A] bg-[#C7FF4A]/10 border border-[#C7FF4A]/30 px-1.5 py-0.5 rounded">
                            From What-If
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 mt-0.5">
                        <span className="font-mono-num text-zinc-400">Day {tx.cycleDay}</span>
                        <span>·</span>
                        <span>{catMeta.name}</span>
                        <span>·</span>
                        <span className="font-mono-num">{tx.date}</span>
                        {tx.notes && (
                          <>
                            <span>·</span>
                            <span className="text-zinc-400 italic">“{tx.notes}”</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div className="text-right">
                      <div
                        className={`text-base font-bold font-mono-num ${
                          isExpense ? 'text-zinc-200' : 'text-[#C7FF4A]'
                        }`}
                      >
                        {isExpense ? `-${formatINR(tx.amount)}` : `+${formatINR(tx.amount)}`}
                      </div>
                      <div className="text-[10px] uppercase font-mono-num text-zinc-500 tracking-wider">
                        {isExpense ? 'Paid' : 'Income'}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenEditModal(tx)}
                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-[#222925] rounded-lg transition-colors"
                        title="Edit transaction"
                        aria-label="Edit transaction"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteCandidate(tx)}
                        className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete transaction"
                        aria-label="Delete transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm text-zinc-400">No transactions match your search filters.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
                setSelectedCategory('all');
              }}
              className="text-xs text-[#C7FF4A] hover:underline font-semibold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteCandidate}
        title="Delete Transaction"
        message={`Are you sure you want to delete "${deleteCandidate?.title}" (${formatINR(
          deleteCandidate?.amount || 0
        )})? This will automatically recalculate your remaining cash and daily safe-to-spend allowance.`}
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteCandidate(null)}
      />
    </div>
  );
};
