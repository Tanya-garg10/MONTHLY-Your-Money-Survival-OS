import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, CategoryId } from '../../types/finance';
import { CATEGORY_LIST } from '../../data/categories';
import { CategoryIcon } from '../common/CategoryIcon';
import { X, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  initialTransaction?: Transaction | null;
  onClose: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  initialTransaction,
  onClose,
}) => {
  const { state, addTransaction, updateTransaction } = useFinance();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState<CategoryId>('food');
  const [cycleDay, setCycleDay] = useState(state.currentDay);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialTransaction) {
      setTitle(initialTransaction.title);
      setAmount(initialTransaction.amount.toString());
      setType(initialTransaction.type);
      setCategory(initialTransaction.category);
      setCycleDay(initialTransaction.cycleDay);
      setDate(initialTransaction.date);
      setNotes(initialTransaction.notes || '');
    } else {
      setTitle('');
      setAmount('');
      setType('expense');
      setCategory('food');
      setCycleDay(state.currentDay);
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
    setError('');
  }, [initialTransaction, isOpen, state.currentDay]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (!title.trim()) {
      setError('Please provide a title for the transaction.');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than ₹0.');
      return;
    }

    if (initialTransaction) {
      updateTransaction(initialTransaction.id, {
        title: title.trim(),
        amount: Math.round(parsedAmount),
        type,
        category,
        cycleDay: Number(cycleDay),
        date,
        notes: notes.trim() || undefined,
      });
    } else {
      addTransaction({
        title: title.trim(),
        amount: Math.round(parsedAmount),
        type,
        category,
        cycleDay: Number(cycleDay),
        date,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg bg-[#141816] border border-[#222925] rounded-xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-modal-title"
      >
        <div className="flex items-center justify-between border-b border-[#222925] pb-3">
          <h2 id="transaction-modal-title" className="text-base font-semibold text-zinc-100">
            {initialTransaction ? 'Edit Transaction' : 'Record New Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-400 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Segmented Toggle */}
          <div className="grid grid-cols-2 p-1 bg-[#0B0D0C] border border-[#222925] rounded-lg">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
                type === 'expense'
                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Expense</span>
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
                type === 'income'
                  ? 'bg-[#C7FF4A]/15 text-[#C7FF4A] border border-[#C7FF4A]/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Income</span>
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">
                ₹
              </span>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 bg-[#0B0D0C] border border-[#222925] focus:border-[#C7FF4A] rounded-lg text-sm text-white font-mono-num font-semibold outline-none transition-colors"
                autoFocus
              />
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Description / Merchant
            </label>
            <input
              type="text"
              placeholder="e.g. Blinkit snacks, Metro recharge, Freelance split"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0B0D0C] border border-[#222925] focus:border-[#C7FF4A] rounded-lg text-sm text-white outline-none transition-colors placeholder:text-zinc-600"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORY_LIST.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all ${
                      isSelected
                        ? 'border-[#C7FF4A] bg-[#C7FF4A]/10 text-white'
                        : 'border-[#222925] bg-[#0B0D0C] text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <CategoryIcon
                      name={cat.id}
                      className="w-3.5 h-3.5 shrink-0"
                      style={{ color: cat.color }}
                    />
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cycle Day & Calendar Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Cycle Day (1-30)
              </label>
              <input
                type="number"
                min="1"
                max={state.cycleTotalDays}
                value={cycleDay}
                onChange={(e) => setCycleDay(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-[#0B0D0C] border border-[#222925] focus:border-[#C7FF4A] rounded-lg text-xs font-mono-num text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#0B0D0C] border border-[#222925] focus:border-[#C7FF4A] rounded-lg text-xs font-mono-num text-white outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Optional Note
            </label>
            <input
              type="text"
              placeholder="Any details to remember..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#0B0D0C] border border-[#222925] focus:border-[#C7FF4A] rounded-lg text-xs text-white outline-none placeholder:text-zinc-600"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#222925]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white bg-[#191E1B] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-black bg-[#C7FF4A] hover:bg-[#b5ee3a] rounded-lg transition-colors"
            >
              {initialTransaction ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
