import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { CategoryId } from '../../types/finance';
import { CATEGORY_LIST, CATEGORIES } from '../../data/categories';
import { CategoryIcon } from '../common/CategoryIcon';
import { formatINR, formatPercent } from '../../utils/formatters';
import {
  AlertTriangle,
  Info,
  CheckCircle2,
  Sliders,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export const BudgetPlannerTab: React.FC = () => {
  const { state, metrics, updateCategoryBudget, showToast } = useFinance();

  // Total allocated across all categories
  const totalAllocated = Object.values(state.categoryBudgets).reduce((sum, val) => sum + val, 0);
  const diffFromBudget = totalAllocated - state.openingBudget;

  const handleSliderChange = (catId: CategoryId, value: number) => {
    updateCategoryBudget(catId, value);
  };

  const handleApplyPreset = (preset: 'balanced' | 'survival' | 'default') => {
    if (preset === 'default') {
      CATEGORY_LIST.forEach((cat) => {
        updateCategoryBudget(cat.id, cat.defaultAllocation);
      });
      showToast('Reset category budgets to default allocations', 'info');
    } else if (preset === 'survival') {
      // Prioritize food and bills; cut shopping & entertainment
      updateCategoryBudget('food', 4200);
      updateCategoryBudget('bills', 2000);
      updateCategoryBudget('transport', 1000);
      updateCategoryBudget('emergency', 1000);
      updateCategoryBudget('personal_care', 500);
      updateCategoryBudget('shopping', 400);
      updateCategoryBudget('entertainment', 500);
      updateCategoryBudget('other', 400);
      showToast('Applied Strict Survival budget preset', 'info');
    } else if (preset === 'balanced') {
      updateCategoryBudget('food', 3400);
      updateCategoryBudget('bills', 1800);
      updateCategoryBudget('transport', 1200);
      updateCategoryBudget('shopping', 1000);
      updateCategoryBudget('entertainment', 900);
      updateCategoryBudget('personal_care', 700);
      updateCategoryBudget('emergency', 600);
      updateCategoryBudget('other', 400);
      showToast('Applied Balanced preset', 'info');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Budget Planner</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Allocate your planned spending limits. Adjusting allocations shapes your targets without changing your cash in hand.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleApplyPreset('survival')}
            className="px-3 py-1.5 bg-[#141816] hover:bg-[#191E1B] border border-[#222925] text-xs font-semibold text-zinc-300 hover:text-white rounded-lg transition-colors"
          >
            Strict Survival
          </button>
          <button
            onClick={() => handleApplyPreset('balanced')}
            className="px-3 py-1.5 bg-[#141816] hover:bg-[#191E1B] border border-[#222925] text-xs font-semibold text-zinc-300 hover:text-white rounded-lg transition-colors"
          >
            Balanced
          </button>
          <button
            onClick={() => handleApplyPreset('default')}
            className="p-1.5 bg-[#141816] hover:bg-[#191E1B] border border-[#222925] text-zinc-400 hover:text-white rounded-lg transition-colors"
            title="Reset to default allocations"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Allocation Overview Bar */}
      <div className="p-6 bg-[#141816] border border-[#222925] rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
              Planned Allocations vs Available Budget
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-white font-mono-num">
                {formatINR(totalAllocated)}
              </span>
              <span className="text-sm font-semibold text-zinc-500 font-mono-num">
                / {formatINR(state.openingBudget)}
              </span>
            </div>
          </div>

          <div className="text-right">
            {diffFromBudget === 0 ? (
              <span className="text-xs font-semibold text-[#C7FF4A] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Exactly 100% of ₹10,000 allocated</span>
              </span>
            ) : diffFromBudget > 0 ? (
              <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Over-allocated by {formatINR(diffFromBudget)}</span>
              </span>
            ) : (
              <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                <Info className="w-4 h-4" />
                <span>Unallocated buffer: {formatINR(Math.abs(diffFromBudget))}</span>
              </span>
            )}
          </div>
        </div>

        {/* Stacked allocation bar */}
        <div className="w-full h-3 bg-[#0B0D0C] rounded-full overflow-hidden flex border border-[#222925]">
          {CATEGORY_LIST.map((cat) => {
            const alloc = state.categoryBudgets[cat.id] || 0;
            const pct = totalAllocated > 0 ? (alloc / totalAllocated) * 100 : 0;
            return (
              <div
                key={cat.id}
                className="h-full transition-all duration-300"
                style={{
                  width: `${pct}%`,
                  backgroundColor: cat.color,
                }}
                title={`${cat.name}: ${formatINR(alloc)} (${Math.round(pct)}%)`}
              />
            );
          })}
        </div>

        {/* Informational callout on accounting boundary */}
        <div className="p-3 bg-[#0B0D0C] border border-[#222925] rounded-xl flex items-start gap-2.5 text-xs text-zinc-400 leading-relaxed">
          <Info className="w-4 h-4 text-[#C7FF4A] shrink-0 mt-0.5" />
          <span>
            <strong>Accounting Integrity Notice:</strong> Adjusting category limits changes your spending targets and warning thresholds. It does not alter your bank balance ({formatINR(metrics.currentCashBalance)} remaining cash), which is determined strictly by real income, expenses, and savings transfers.
          </span>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CATEGORY_LIST.map((cat) => {
          const alloc = state.categoryBudgets[cat.id] || 0;
          const stats = metrics.categorySpending[cat.id] || {
            allocated: alloc,
            spent: 0,
            remaining: alloc,
            percentage: 0,
          };
          const isOverspent = stats.spent > alloc;
          const isWarning = !isOverspent && stats.percentage >= 80;

          return (
            <div
              key={cat.id}
              className="p-5 bg-[#141816] border border-[#222925] rounded-xl space-y-4 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center border border-[#222925]"
                    style={{ backgroundColor: `${cat.color}15` }}
                  >
                    <CategoryIcon
                      name={cat.id}
                      className="w-5 h-5"
                      style={{ color: cat.color }}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{cat.name}</h3>
                    <div className="text-xs text-zinc-500 font-mono-num">
                      Spent: <strong className="text-zinc-300">{formatINR(stats.spent)}</strong>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-bold font-mono-num text-white">
                    {formatINR(alloc)}
                  </div>
                  <div
                    className={`text-[11px] font-semibold font-mono-num ${
                      isOverspent
                        ? 'text-rose-400'
                        : isWarning
                        ? 'text-amber-400'
                        : 'text-[#C7FF4A]'
                    }`}
                  >
                    {isOverspent
                      ? `Over by ${formatINR(stats.spent - alloc)}`
                      : `${formatINR(stats.remaining)} left`}
                  </div>
                </div>
              </div>

              {/* Utilization Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono-num text-zinc-400">
                  <span>Utilization</span>
                  <span className={isOverspent ? 'text-rose-400 font-bold' : ''}>
                    {stats.percentage}%
                  </span>
                </div>
                <div className="w-full h-2 bg-[#0B0D0C] rounded-full overflow-hidden border border-[#222925]">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOverspent ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : ''
                    }`}
                    style={{
                      width: `${Math.min(100, stats.percentage)}%`,
                      backgroundColor: isOverspent ? undefined : isWarning ? undefined : cat.color,
                    }}
                  />
                </div>
              </div>

              {/* Slider & Quick Input */}
              <div className="pt-2 border-t border-[#222925] space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Adjust Allocation</span>
                  <div className="flex items-center gap-1 font-mono-num">
                    <span className="text-zinc-500">₹</span>
                    <input
                      type="number"
                      step="50"
                      min="0"
                      max="10000"
                      value={alloc}
                      onChange={(e) => handleSliderChange(cat.id, Number(e.target.value))}
                      className="w-20 px-2 py-1 bg-[#0B0D0C] border border-[#222925] rounded text-right text-xs text-white outline-none focus:border-[#C7FF4A]"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="50"
                  value={alloc}
                  onChange={(e) => handleSliderChange(cat.id, Number(e.target.value))}
                  className="w-full h-1.5 bg-[#0B0D0C] rounded-lg appearance-none cursor-pointer accent-[#C7FF4A]"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
