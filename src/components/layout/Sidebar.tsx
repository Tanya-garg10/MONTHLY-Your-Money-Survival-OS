import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../utils/formatters';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Sliders,
  FlaskConical,
  Target,
  Repeat,
  TrendingUp,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

interface SidebarProps {
  onOpenResetConfirm: () => void;
  onOpenProfile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenResetConfirm, onOpenProfile }) => {
  const { activeTab, setActiveTab, state, metrics } = useFinance();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'budget', label: 'Budget Planner', icon: Sliders },
    { id: 'whatif', label: 'What-If Lab', icon: FlaskConical, badge: 'Simulator' },
    { id: 'savings', label: 'Savings Goals', icon: Target },
    { id: 'subscriptions', label: 'Subscriptions', icon: Repeat },
    { id: 'insights', label: 'Insights', icon: TrendingUp },
  ];

  const cycleProgress = Math.round((state.currentDay / state.cycleTotalDays) * 100);

  return (
    <aside className="hidden lg:flex lg:w-64 xl:w-72 flex-col fixed inset-y-0 left-0 bg-[#0B0D0C] border-r border-[#222925] z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#222925]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C7FF4A] flex items-center justify-center text-black font-extrabold text-sm tracking-tighter">
              M
            </div>
            <div>
              <div className="text-base font-extrabold tracking-wider text-white flex items-center gap-1.5">
                <span>MONTHLY</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#C7FF4A]"></span>
              </div>
              <p className="text-[11px] font-medium text-zinc-400 tracking-tight">
                Make it to day 30.
              </p>
            </div>
          </div>
        </div>

        {/* 30-Day Budget Cycle Widget */}
        <div className="mt-4 p-3 bg-[#141816] border border-[#222925] rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">Cycle Day {state.currentDay} of {state.cycleTotalDays}</span>
            <span className="text-[#C7FF4A] font-semibold font-mono-num">{metrics.remainingDays}d left</span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-[#222925] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#C7FF4A] rounded-full transition-all duration-300"
              style={{ width: `${cycleProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono-num">
            <span>Day 1</span>
            <span>Target: {formatINR(state.openingBudget)}</span>
            <span>Day 30</span>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs xl:text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#141816] text-[#C7FF4A] border border-[#C7FF4A]/30 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#141816]/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-[#C7FF4A]' : 'text-zinc-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] uppercase font-mono-num tracking-wider text-[#C7FF4A]/90">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Financial Health Mini Bar */}
      <div className="px-4 py-3 mx-3 mb-2 bg-[#141816] border border-[#222925] rounded-xl space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C7FF4A]" />
            Survival Score
          </span>
          <span className="font-mono-num font-bold text-zinc-200">
            {metrics.healthScore}<span className="text-zinc-500 font-normal">/100</span>
          </span>
        </div>
        <div className="w-full h-1 bg-[#222925] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              metrics.healthScore >= 75
                ? 'bg-[#C7FF4A]'
                : metrics.healthScore >= 50
                ? 'bg-amber-400'
                : 'bg-rose-500'
            }`}
            style={{ width: `${metrics.healthScore}%` }}
          />
        </div>
        <div className="text-[10px] text-zinc-500 truncate">
          {metrics.riskTitle}
        </div>
      </div>

      {/* Footer Profile & Reset */}
      <div className="p-3 border-t border-[#222925] flex items-center justify-between gap-2">
        <button
          onClick={onOpenProfile}
          className="flex-1 flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#141816] transition-colors text-left"
          title="Open Profile"
        >
          <div className="w-7 h-7 rounded-full bg-[#C7FF4A]/10 border border-[#C7FF4A]/40 flex items-center justify-center text-[#C7FF4A] text-xs font-bold font-mono-num">
            AS
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold text-zinc-200 truncate">Aarav S.</div>
            <div className="text-[10px] text-zinc-500 truncate">₹10K Survivor</div>
          </div>
        </button>

        <button
          onClick={onOpenResetConfirm}
          className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg border border-transparent hover:border-rose-500/20 transition-all"
          title="Reset Demo to Day 12"
          aria-label="Reset Demo to Day 12"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
