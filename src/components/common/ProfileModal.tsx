import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../utils/formatters';
import { User, ShieldCheck, Calendar, Wallet, RotateCcw, X, Target, Bell } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenResetConfirm: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenResetConfirm,
}) => {
  const { state, metrics } = useFinance();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg bg-[#141816] border border-[#222925] rounded-xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
      >
        <div className="flex items-center justify-between border-b border-[#222925] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#C7FF4A]/10 border border-[#C7FF4A]/30 flex items-center justify-center text-[#C7FF4A] font-bold text-base font-mono-num">
              MO
            </div>
            <div>
              <h2 id="profile-modal-title" className="text-base font-semibold text-zinc-100">
                Aarav Sharma
              </h2>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span>College Student</span>
                <span>·</span>
                <span className="text-[#C7FF4A]">Day 30 Survivor</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-md transition-colors"
            aria-label="Close profile dialog"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Cycle & Financial Health Snapshot */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-[#0B0D0C] border border-[#222925] rounded-lg">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1">
              <Calendar className="w-3.5 h-3.5 text-[#C7FF4A]" />
              <span>Current Cycle</span>
            </div>
            <div className="text-sm font-semibold text-zinc-200">
              Day {state.currentDay} of {state.cycleTotalDays}
            </div>
            <div className="text-xs text-zinc-500 mt-0.5">
              {metrics.remainingDays} days remaining
            </div>
          </div>

          <div className="p-3 bg-[#0B0D0C] border border-[#222925] rounded-lg">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C7FF4A]" />
              <span>Health Score</span>
            </div>
            <div className="text-sm font-semibold text-zinc-200 font-mono-num">
              {metrics.healthScore} / 100
            </div>
            <div className="text-xs text-zinc-500 mt-0.5">
              {metrics.riskTitle}
            </div>
          </div>
        </div>

        {/* Operating Rules Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Survival Rules & Accounting Engine
          </h3>
          <div className="bg-[#0B0D0C] border border-[#222925] rounded-lg p-3 space-y-2 text-xs text-zinc-300 leading-relaxed">
            <div className="flex items-start gap-2">
              <span className="text-[#C7FF4A] font-bold">1.</span>
              <span>
                <strong>Opening Budget:</strong> Started with {formatINR(state.openingBudget)} for 30 days ({formatINR(metrics.targetDailyBudget)}/day standard benchmark).
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#C7FF4A] font-bold">2.</span>
              <span>
                <strong>Safe-to-Spend:</strong> Strictly calculated as available uncommitted cash divided by remaining days ({metrics.remainingDays} days).
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#C7FF4A] font-bold">3.</span>
              <span>
                <strong>Savings Transfers:</strong> Moving cash to goals reduces spendable cash immediately without double-counting.
              </span>
            </div>
          </div>
        </div>

        {/* Reset Demo Option */}
        <div className="pt-2 border-t border-[#222925] flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-zinc-300">Reset Demo Scenario</div>
            <div className="text-[11px] text-zinc-500">
              Restore initial Day 12 baseline (₹6,750 cash, ₹3,250 spent)
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              onOpenResetConfirm();
            }}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
