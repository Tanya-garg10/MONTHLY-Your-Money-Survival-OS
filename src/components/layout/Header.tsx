import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../utils/formatters';
import {
  FlaskConical,
  Plus,
  RotateCcw,
  User,
  Calendar,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  onOpenResetConfirm: () => void;
  onOpenProfile: () => void;
  onOpenAddTx: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenResetConfirm,
  onOpenProfile,
  onOpenAddTx,
}) => {
  const { state, metrics, activeTab, setActiveTab } = useFinance();

  return (
    <header className="sticky top-0 z-20 bg-[#0B0D0C]/90 backdrop-blur-md border-b border-[#222925] px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
      {/* Left: Mobile Brand & Cycle Indicator */}
      <div className="flex items-center gap-3">
        <div className="lg:hidden flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#C7FF4A] flex items-center justify-center text-black font-extrabold text-xs">
            M
          </div>
          <span className="font-extrabold tracking-wider text-sm text-white">MONTHLY</span>
        </div>

        {/* Cycle progress capsule */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#141816] border border-[#222925] rounded-lg text-xs">
          <Calendar className="w-3.5 h-3.5 text-[#C7FF4A]" />
          <span className="text-zinc-400">Day</span>
          <span className="text-white font-mono-num font-bold">{state.currentDay}</span>
          <span className="text-zinc-500">/</span>
          <span className="text-zinc-400 font-mono-num">{state.cycleTotalDays}</span>
          <span className="text-zinc-600">·</span>
          <span className="text-[#C7FF4A] font-medium font-mono-num">{metrics.remainingDays} days left</span>
        </div>
      </div>

      {/* Right Action Cluster */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Simulator CTA */}
        <button
          onClick={() => setActiveTab('whatif')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'whatif'
              ? 'bg-[#C7FF4A] text-black shadow-sm'
              : 'bg-[#141816] hover:bg-[#191E1B] text-zinc-300 hover:text-white border border-[#222925] hover:border-[#C7FF4A]/40'
          }`}
          title="Open What-If Lab Decision Simulator"
        >
          <FlaskConical className="w-3.5 h-3.5 text-[#C7FF4A]" />
          <span className="hidden xs:inline">What-If Lab</span>
        </button>

        {/* Quick Add Transaction */}
        <button
          onClick={onOpenAddTx}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C7FF4A] hover:bg-[#b5ee3a] text-black font-semibold text-xs rounded-lg transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Entry</span>
        </button>

        {/* Reset button (visible on smaller screens too) */}
        <button
          onClick={onOpenResetConfirm}
          className="lg:hidden p-2 text-zinc-400 hover:text-rose-400 bg-[#141816] border border-[#222925] rounded-lg transition-colors"
          title="Reset Demo"
          aria-label="Reset Demo"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Profile Avatar */}
        <button
          onClick={onOpenProfile}
          className="w-8 h-8 rounded-full bg-[#141816] hover:bg-[#191E1B] border border-[#222925] hover:border-[#C7FF4A]/40 flex items-center justify-center text-xs font-bold font-mono-num text-[#C7FF4A] transition-colors"
          title="Account Profile"
          aria-label="Account Profile"
        >
          AS
        </button>
      </div>
    </header>
  );
};
