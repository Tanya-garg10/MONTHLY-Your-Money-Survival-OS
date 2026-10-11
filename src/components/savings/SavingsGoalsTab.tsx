import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal } from '../../types/finance';
import { formatINR } from '../../utils/formatters';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Target,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

export const SavingsGoalsTab: React.FC = () => {
  const {
    state,
    metrics,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    contributeToGoal,
    withdrawFromGoal,
  } = useFinance();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [transferModal, setTransferModal] = useState<{
    goal: SavingsGoal;
    type: 'deposit' | 'withdraw';
  } | null>(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [deleteCandidate, setDeleteCandidate] = useState<SavingsGoal | null>(null);

  // Form states for Add/Edit
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [targetDay, setTargetDay] = useState('30');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  const openAdd = () => {
    setEditingGoal(null);
    setGoalName('');
    setTargetAmount('1000');
    setPriority('medium');
    setTargetDay('30');
    setNotes('');
    setFormError('');
    setIsAddOpen(true);
  };

  const openEdit = (g: SavingsGoal) => {
    setEditingGoal(g);
    setGoalName(g.name);
    setTargetAmount(g.targetAmount.toString());
    setPriority(g.priority);
    setTargetDay(g.targetDay.toString());
    setNotes(g.notes || '');
    setFormError('');
    setIsAddOpen(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const amt = parseFloat(targetAmount);
    if (!goalName.trim()) {
      setFormError('Please enter a goal name.');
      return;
    }
    if (isNaN(amt) || amt <= 0) {
      setFormError('Please enter a target amount greater than ₹0.');
      return;
    }

    if (editingGoal) {
      updateSavingsGoal(editingGoal.id, {
        name: goalName.trim(),
        targetAmount: Math.round(amt),
        priority,
        targetDay: Number(targetDay) || 30,
        notes: notes.trim() || undefined,
      });
    } else {
      addSavingsGoal({
        name: goalName.trim(),
        targetAmount: Math.round(amt),
        priority,
        targetDay: Number(targetDay) || 30,
        notes: notes.trim() || undefined,
      });
    }

    setIsAddOpen(false);
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferModal) return;

    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0) return;

    if (transferModal.type === 'deposit') {
      const ok = contributeToGoal(transferModal.goal.id, amt);
      if (ok) setTransferModal(null);
    } else {
      const ok = withdrawFromGoal(transferModal.goal.id, amt);
      if (ok) setTransferModal(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Savings Goals</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Lock away buffers without double-counting cash. Every deposit securely reduces spendable allowance.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#C7FF4A] hover:bg-[#b5ee3a] text-black font-bold text-xs sm:text-sm rounded-lg transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C7FF4A] focus:ring-offset-2 focus:ring-offset-[#0B0D0C]"
          aria-label="Create new savings goal"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-[#141816] border border-[#222925] rounded-xl">
          <div className="text-xs text-zinc-400 font-medium">Total Saved in Goals</div>
          <div className="mt-1 text-2xl font-bold font-mono-num text-[#C7FF4A]">
            {formatINR(metrics.totalSavedInGoals)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Secured from daily discretionary spend</div>
        </div>

        <div className="p-4 bg-[#141816] border border-[#222925] rounded-xl">
          <div className="text-xs text-zinc-400 font-medium">Available Cash in Hand</div>
          <div className="mt-1 text-2xl font-bold font-mono-num text-white">
            {formatINR(metrics.currentCashBalance)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Safe to spend: <span className="text-[#C7FF4A]">{formatINR(metrics.safeToSpendPerDay)}/day</span>
          </div>
        </div>

        <div className="p-4 bg-[#141816] border border-[#222925] rounded-xl">
          <div className="text-xs text-zinc-400 font-medium">Remaining Cycle Days</div>
          <div className="mt-1 text-2xl font-bold font-mono-num text-zinc-300">
            {metrics.remainingDays} days
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Until Day 30 finish line</div>
        </div>
      </div>

      {/* Accounting Banner */}
      <div className="p-4 bg-[#0B0D0C] border border-[#222925] rounded-xl flex items-start gap-3 text-xs text-zinc-400 leading-relaxed">
        <ShieldCheck className="w-4 h-4 text-[#C7FF4A] shrink-0 mt-0.5" />
        <span>
          <strong>Strict Conservation of Funds:</strong> Depositing into a goal removes that cash from your spendable balance immediately. If you need it back before Day 30, use “Withdraw to Cash” to release funds back into circulation.
        </span>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {state.savingsGoals.map((goal) => {
          const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
          const percent = Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100));
          const daysLeftForGoal = Math.max(1, goal.targetDay - state.currentDay);
          const dailyNeeded = Math.round(remaining / daysLeftForGoal);
          const isRealistic = dailyNeeded <= metrics.safeToSpendPerDay;

          return (
            <div
              key={goal.id}
              className="p-6 bg-[#141816] border border-[#222925] rounded-2xl space-y-5 hover:border-zinc-700 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{goal.name}</h3>
                      <span
                        className={`text-[10px] uppercase font-mono-num px-2 py-0.5 rounded-full border ${
                          goal.priority === 'high'
                            ? 'text-rose-400 border-rose-500/30 bg-rose-500/10'
                            : goal.priority === 'medium'
                            ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                            : 'text-zinc-400 border-zinc-700 bg-zinc-800'
                        }`}
                      >
                        {goal.priority} priority
                      </span>
                    </div>
                    {goal.notes && (
                      <p className="text-xs text-zinc-400 mt-1 italic">“{goal.notes}”</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(goal)}
                      className="p-1.5 text-zinc-400 hover:text-white hover:bg-[#222925] rounded-lg transition-colors"
                      title="Edit goal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteCandidate(goal)}
                      className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Delete goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Numbers */}
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <div className="text-2xl font-extrabold text-white font-mono-num">
                      {formatINR(goal.savedAmount)}
                    </div>
                    <div className="text-xs text-zinc-500 font-mono-num">
                      Target: {formatINR(goal.targetAmount)} ({formatINR(remaining)} remaining)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold font-mono-num text-[#C7FF4A]">
                      {percent}%
                    </div>
                    <div className="text-[11px] text-zinc-500">Day {goal.targetDay} goal</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 bg-[#0B0D0C] rounded-full overflow-hidden border border-[#222925]">
                  <div
                    className="h-full bg-gradient-to-r from-[#C7FF4A] to-[#80E020] rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {/* Feasibility & Daily Rate */}
                <div className="p-3 bg-[#0B0D0C] border border-[#222925] rounded-xl flex items-center justify-between text-xs font-mono-num">
                  <div className="text-zinc-400">
                    Need: <strong className="text-white">{formatINR(dailyNeeded)}/day</strong> for {daysLeftForGoal}d
                  </div>
                  <div
                    className={`flex items-center gap-1 font-semibold ${
                      isRealistic ? 'text-[#C7FF4A]' : 'text-amber-400'
                    }`}
                  >
                    {isRealistic ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Realistic</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Stretch Goal</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Deposit & Withdraw */}
              <div className="pt-4 border-t border-[#222925] grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setTransferModal({ goal, type: 'deposit' });
                    setTransferAmount('250');
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#C7FF4A] hover:bg-[#b5ee3a] text-black font-bold text-xs rounded-lg transition-colors"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Deposit Cash</span>
                </button>
                <button
                  disabled={goal.savedAmount <= 0}
                  onClick={() => {
                    setTransferModal({ goal, type: 'withdraw' });
                    setTransferAmount(goal.savedAmount.toString());
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#0B0D0C] hover:bg-[#191E1B] border border-[#222925] text-zinc-300 hover:text-white font-semibold text-xs rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>Release to Cash</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add / Edit Goal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-[#141816] border border-[#222925] rounded-xl p-6 shadow-2xl space-y-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="savings-modal-title"
          >
            <h2 id="savings-modal-title" className="text-base font-bold text-white">
              {editingGoal ? 'Edit Savings Goal' : 'Create Savings Goal'}
            </h2>

            {formError && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-400" role="alert">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label htmlFor="savings-goal-name" className="block text-xs font-medium text-zinc-400 mb-1">
                  Goal Name
                </label>
                <input
                  id="savings-goal-name"
                  type="text"
                  placeholder="e.g. Month-End Cushion, New Headphones"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0D0C] border border-[#222925] focus:border-[#C7FF4A] rounded-lg text-xs text-white outline-none"
                  autoFocus
                  aria-invalid={formError !== ''}
                  aria-describedby={formError ? 'savings-form-error' : undefined}
                />
              </div>

              <div>
                <label htmlFor="savings-target-amount" className="block text-xs font-medium text-zinc-400 mb-1">
                  Target Amount (₹)
                </label>
                <input
                  id="savings-target-amount"
                  type="number"
                  min="1"
                  step="50"
                  placeholder="1000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0D0C] border border-[#222925] focus:border-[#C7FF4A] rounded-lg text-xs font-mono-num text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="savings-priority" className="block text-xs font-medium text-zinc-400 mb-1">
                    Priority
                  </label>
                  <select
                    id="savings-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#0B0D0C] border border-[#222925] text-xs text-white rounded-lg outline-none"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="savings-target-day" className="block text-xs font-medium text-zinc-400 mb-1">
                    Target Cycle Day
                  </label>
                  <input
                    id="savings-target-day"
                    type="number"
                    min="1"
                    max={state.cycleTotalDays}
                    value={targetDay}
                    onChange={(e) => setTargetDay(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0D0C] border border-[#222925] text-xs font-mono-num text-white rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="savings-notes" className="block text-xs font-medium text-zinc-400 mb-1">
                  Optional Notes
                </label>
                <input
                  id="savings-notes"
                  type="text"
                  placeholder="What's this buffer for?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0D0C] border border-[#222925] text-xs text-white rounded-lg outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#222925]">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white bg-[#191E1B] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-black bg-[#C7FF4A] hover:bg-[#b5ee3a] rounded-lg"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Deposit or Withdraw Transfer */}
      {transferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#141816] border border-[#222925] rounded-xl p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-white">
              {transferModal.type === 'deposit'
                ? `Deposit to "${transferModal.goal.name}"`
                : `Withdraw from "${transferModal.goal.name}"`}
            </h2>

            <p className="text-xs text-zinc-400 leading-relaxed">
              {transferModal.type === 'deposit'
                ? `Transfers money from your available cash (${formatINR(
                    metrics.currentCashBalance
                  )}) into this goal. Your daily safe allowance will adjust accordingly.`
                : `Returns locked funds back to your spendable cash balance.`}
            </p>

            <form onSubmit={handleExecuteTransfer} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  step="10"
                  max={
                    transferModal.type === 'deposit'
                      ? metrics.currentCashBalance
                      : transferModal.goal.savedAmount
                  }
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0D0C] border border-[#222925] focus:border-[#C7FF4A] rounded-lg text-sm font-mono-num font-bold text-white outline-none"
                  autoFocus
                />
              </div>

              {/* Quick suggestion amounts */}
              <div className="flex items-center gap-2">
                {[100, 250, 500, 1000].map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setTransferAmount(step.toString())}
                    className="px-2 py-1 text-[11px] font-mono-num rounded border border-[#222925] bg-[#0B0D0C] text-zinc-400 hover:text-white"
                  >
                    ₹{step}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#222925]">
                <button
                  type="button"
                  onClick={() => setTransferModal(null)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white bg-[#191E1B] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-black bg-[#C7FF4A] hover:bg-[#b5ee3a] rounded-lg"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteCandidate}
        title="Delete Savings Goal"
        message={`Are you sure you want to delete "${deleteCandidate?.name}"? ${
          deleteCandidate && deleteCandidate.savedAmount > 0
            ? `All ${formatINR(deleteCandidate.savedAmount)} saved in this goal will be immediately returned to your available cash.`
            : ''
        }`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (deleteCandidate) {
            deleteSavingsGoal(deleteCandidate.id);
            setDeleteCandidate(null);
          }
        }}
        onCancel={() => setDeleteCandidate(null)}
      />
    </div>
  );
};
