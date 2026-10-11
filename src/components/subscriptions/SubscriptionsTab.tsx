import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Subscription, SubscriptionStatus, CategoryId } from '../../types/finance';
import { CATEGORY_LIST, CATEGORIES } from '../../data/categories';
import { CategoryIcon } from '../common/CategoryIcon';
import { formatINR } from '../../utils/formatters';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Repeat,
  Plus,
  Pause,
  Play,
  XCircle,
  Trash2,
  Edit2,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

export const SubscriptionsTab: React.FC = () => {
  const {
    state,
    metrics,
    addSubscription,
    updateSubscription,
    toggleSubscriptionStatus,
    deleteSubscription,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Subscription | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [cycleDueDay, setCycleDueDay] = useState('15');
  const [category, setCategory] = useState<CategoryId>('entertainment');
  const [icon, setIcon] = useState('Music');
  const [formError, setFormError] = useState('');

  const openAdd = () => {
    setEditingSub(null);
    setName('');
    setAmount('199');
    setFrequency('monthly');
    setCycleDueDay('15');
    setCategory('entertainment');
    setIcon('Music');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEdit = (sub: Subscription) => {
    setEditingSub(sub);
    setName(sub.name);
    setAmount(sub.amount.toString());
    setFrequency(sub.frequency);
    setCycleDueDay(sub.cycleDueDay.toString());
    setCategory(sub.category);
    setIcon(sub.icon || 'Music');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const amt = parseFloat(amount);
    if (!name.trim()) {
      setFormError('Please enter subscription name.');
      return;
    }
    if (isNaN(amt) || amt <= 0) {
      setFormError('Please enter a valid billing amount.');
      return;
    }

    if (editingSub) {
      updateSubscription(editingSub.id, {
        name: name.trim(),
        amount: Math.round(amt),
        frequency,
        cycleDueDay: Number(cycleDueDay) || 1,
        category,
        icon,
      });
    } else {
      addSubscription({
        name: name.trim(),
        amount: Math.round(amt),
        frequency,
        cycleDueDay: Number(cycleDueDay) || 1,
        status: 'active',
        category,
        icon,
      });
    }

    setIsModalOpen(false);
  };

  // Calculations for active vs cancelled savings
  const activeSubs = state.subscriptions.filter((s) => s.status === 'active');
  const pausedSubs = state.subscriptions.filter((s) => s.status === 'paused');
  const cancelledSubs = state.subscriptions.filter((s) => s.status === 'cancelled');

  const totalActiveMonthly = activeSubs.reduce((sum, s) => sum + s.amount, 0);
  const totalSavedMonthly = cancelledSubs.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Subscription Manager
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Track, pause, or cancel recurring drains. Cancelling prevents future charges and lifts your safe-to-spend allowance.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#C7FF4A] hover:bg-[#b5ee3a] text-black font-bold text-xs sm:text-sm rounded-lg transition-all shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Subscription</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-[#141816] border border-[#222925] rounded-xl">
          <div className="text-xs text-zinc-400 font-medium">Active Recurring Commitments</div>
          <div className="mt-1 text-2xl font-bold font-mono-num text-white">
            {formatINR(totalActiveMonthly)}/mo
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {activeSubs.length} active service{activeSubs.length === 1 ? '' : 's'}
          </div>
        </div>

        <div className="p-4 bg-[#141816] border border-[#222925] rounded-xl">
          <div className="text-xs text-zinc-400 font-medium">Upcoming Dues This Cycle</div>
          <div className="mt-1 text-2xl font-bold font-mono-num text-amber-400">
            {formatINR(metrics.upcomingReservedCommitments)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Due between Day {state.currentDay + 1} and Day 30</div>
        </div>

        <div className="p-4 bg-[#141816] border border-[#222925] rounded-xl">
          <div className="text-xs text-zinc-400 font-medium">Unlocked Monthly Savings</div>
          <div className="mt-1 text-2xl font-bold font-mono-num text-[#C7FF4A]">
            {formatINR(totalSavedMonthly)}/mo
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">From {cancelledSubs.length} cancelled subscription(s)</div>
        </div>
      </div>

      {/* Cancellation Rules Notice */}
      <div className="p-4 bg-[#0B0D0C] border border-[#222925] rounded-xl flex items-start gap-3 text-xs text-zinc-400 leading-relaxed">
        <Info className="w-4 h-4 text-[#C7FF4A] shrink-0 mt-0.5" />
        <span>
          <strong>Future Billing Principle:</strong> Cancelling or pausing a subscription removes its future projected charges and immediately frees up your month-end runway. Past recorded subscription payments in your transaction history are preserved intact.
        </span>
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.subscriptions.map((sub) => {
          const isDueFuture = sub.cycleDueDay > state.currentDay;
          const daysUntil = sub.cycleDueDay - state.currentDay;

          return (
            <div
              key={sub.id}
              className={`p-5 bg-[#141816] border rounded-2xl space-y-4 transition-colors ${
                sub.status === 'cancelled'
                  ? 'border-[#222925] opacity-60'
                  : sub.status === 'paused'
                  ? 'border-amber-500/30'
                  : 'border-[#222925] hover:border-zinc-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0B0D0C] border border-[#222925] flex items-center justify-center text-zinc-200">
                    <CategoryIcon name={sub.icon || sub.category} className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{sub.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono-num">
                      <span>Cycle Day {sub.cycleDueDay}</span>
                      <span>·</span>
                      <span className="capitalize">{sub.frequency}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-bold font-mono-num text-white">
                    {formatINR(sub.amount)}
                  </div>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider ${
                      sub.status === 'active'
                        ? 'text-[#C7FF4A]'
                        : sub.status === 'paused'
                        ? 'text-amber-400'
                        : 'text-zinc-500 line-through'
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>
              </div>

              {/* Due Date Indicator */}
              <div className="p-2.5 bg-[#0B0D0C] border border-[#222925] rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  <span>
                    {sub.status === 'cancelled'
                      ? 'No upcoming charges scheduled'
                      : sub.status === 'paused'
                      ? 'Billing paused'
                      : isDueFuture
                      ? `Charges in ${daysUntil} day${daysUntil === 1 ? '' : 's'} (Day ${sub.cycleDueDay})`
                      : `Charged on Day ${sub.cycleDueDay} of current cycle`}
                  </span>
                </div>
                {sub.status === 'active' && isDueFuture && (
                  <span className="text-[11px] font-mono-num font-semibold text-amber-400">
                    Upcoming
                  </span>
                )}
              </div>

              {/* Status Action Buttons */}
              <div className="pt-2 border-t border-[#222925] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {sub.status === 'active' ? (
                    <>
                      <button
                        onClick={() => toggleSubscriptionStatus(sub.id, 'paused')}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-[#0B0D0C] hover:bg-[#191E1B] border border-[#222925] rounded-lg text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        <Pause className="w-3 h-3" />
                        <span>Pause</span>
                      </button>
                      <button
                        onClick={() => toggleSubscriptionStatus(sub.id, 'cancelled')}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Cancel Sub</span>
                      </button>
                    </>
                  ) : sub.status === 'paused' ? (
                    <>
                      <button
                        onClick={() => toggleSubscriptionStatus(sub.id, 'active')}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-[#C7FF4A]/10 hover:bg-[#C7FF4A]/20 border border-[#C7FF4A]/30 rounded-lg text-xs font-semibold text-[#C7FF4A] transition-colors"
                      >
                        <Play className="w-3 h-3" />
                        <span>Resume</span>
                      </button>
                      <button
                        onClick={() => toggleSubscriptionStatus(sub.id, 'cancelled')}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg text-xs font-semibold text-rose-400 transition-colors"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Cancel</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => toggleSubscriptionStatus(sub.id, 'active')}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-[#0B0D0C] hover:bg-[#191E1B] border border-[#222925] rounded-lg text-xs font-medium text-[#C7FF4A] transition-colors"
                    >
                      <Play className="w-3 h-3" />
                      <span>Re-activate</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(sub)}
                    className="p-1.5 text-zinc-400 hover:text-white hover:bg-[#222925] rounded-lg transition-colors"
                    title="Edit subscription"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteCandidate(sub)}
                    className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Delete subscription"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Subscription Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#141816] border border-[#222925] rounded-xl p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-white">
              {editingSub ? 'Edit Subscription' : 'Add Recurring Subscription'}
            </h2>

            {formError && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-400">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Service / Provider
                </label>
                <input
                  type="text"
                  placeholder="e.g. Spotify, YouTube Premium, Gym"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0D0C] border border-[#222925] focus:border-[#C7FF4A] rounded-lg text-xs text-white outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="199"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0D0C] border border-[#222925] focus:border-[#C7FF4A] rounded-lg text-xs font-mono-num text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Cycle Due Day (1-30)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={state.cycleTotalDays}
                    value={cycleDueDay}
                    onChange={(e) => setCycleDueDay(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0D0C] border border-[#222925] focus:border-[#C7FF4A] rounded-lg text-xs font-mono-num text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#0B0D0C] border border-[#222925] text-xs text-white rounded-lg outline-none"
                  >
                    {CATEGORY_LIST.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Icon
                  </label>
                  <select
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0D0C] border border-[#222925] text-xs text-white rounded-lg outline-none"
                  >
                    <option value="Music">Music (Spotify/Apple)</option>
                    <option value="Tv">TV / Video (Netflix/Prime)</option>
                    <option value="Smartphone">Mobile / Data (Jio/Airtel)</option>
                    <option value="Cloud">Cloud Storage</option>
                    <option value="Receipt">Bill / Utility</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#222925]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white bg-[#191E1B] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-black bg-[#C7FF4A] hover:bg-[#b5ee3a] rounded-lg"
                >
                  Save Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteCandidate}
        title="Remove Subscription"
        message={`Are you sure you want to delete "${deleteCandidate?.name}"?`}
        confirmLabel="Remove"
        danger
        onConfirm={() => {
          if (deleteCandidate) {
            deleteSubscription(deleteCandidate.id);
            setDeleteCandidate(null);
          }
        }}
        onCancel={() => setDeleteCandidate(null)}
      />
    </div>
  );
};
