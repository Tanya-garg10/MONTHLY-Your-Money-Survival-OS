import React, { useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR, formatINRCompact } from '../../utils/formatters';
import { CATEGORIES } from '../../data/categories';
import { CategoryIcon } from '../common/CategoryIcon';
import { generate30DayForecast } from '../../engine/calculator';
import { filterUpcomingSubscriptions } from '../../utils/subscriptionHelpers';
import {
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  FlaskConical,
  Calendar,
  Lock,
  Unlock,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  Info,
} from 'lucide-react';

// Import chart components directly since tab is already lazy-loaded
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface OverviewTabProps {
  onOpenAddTx: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ onOpenAddTx }) => {
  const { state, metrics, setActiveTab, toggleReserveCommitments } = useFinance();

  const forecastData = useMemo(() => generate30DayForecast(state), [state]);

  // Donut chart data for category spending
  const categoryPieData = useMemo(() => {
    return Object.entries(metrics.categorySpending)
      .filter(([_, cat]) => cat.spent > 0)
      .map(([id, cat]) => ({
        name: CATEGORIES[id as keyof typeof CATEGORIES]?.name || id,
        value: cat.spent,
        color: CATEGORIES[id as keyof typeof CATEGORIES]?.color || '#94A3B8',
        allocated: cat.allocated,
      }));
  }, [metrics.categorySpending]);

  // Upcoming active subscriptions in this cycle
  const upcomingSubscriptions = useMemo(() => {
    return filterUpcomingSubscriptions(state.subscriptions, state.currentDay)
      .sort((a, b) => a.cycleDueDay - b.cycleDueDay);
  }, [state.subscriptions, state.currentDay]);

  // Recent 5 transactions
  const recentTransactions = useMemo(() => {
    return [...state.transactions].slice(0, 5);
  }, [state.transactions]);

  const spentPercentage = Math.min(
    100,
    Math.round((metrics.totalExpenses / state.openingBudget) * 100)
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner / Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-[#141816] border border-[#222925] rounded-2xl relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-400 font-mono-num font-semibold">
            <span>Cycle 1</span>
            <span>·</span>
            <span>Day {state.currentDay} of {state.cycleTotalDays}</span>
            <span>·</span>
            <span className="text-[#C7FF4A]">Survival Mode Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Your money, your rules.
          </h1>
          <p className="text-sm text-zinc-400 font-medium">
            {metrics.remainingDays} days left. Let's make them count.
          </p>
        </div>

        {/* CTA: What-If Lab Decision Simulator */}
        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={() => setActiveTab('whatif')}
            className="flex items-center gap-2.5 px-4 py-2.5 bg-[#C7FF4A] hover:bg-[#b5ee3a] text-black font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg hover:shadow-[#C7FF4A]/20 group"
            aria-label="Open What-If Lab to simulate financial decisions"
          >
            <FlaskConical className="w-4 h-4 text-black group-hover:rotate-12 transition-transform" aria-hidden="true" />
            <span>Simulate a decision</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Subtle accent glow in corner */}
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-[#C7FF4A]/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Primary KPI Grid (Cards A, B, C) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card A: Prominent Balance Card */}
        <div className="p-6 bg-[#141816] border border-[#222925] rounded-2xl space-y-4 relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold uppercase tracking-wider">Remaining Balance</span>
              <span className="font-mono-num text-[11px] text-zinc-500">
                Budget: {formatINR(state.openingBudget)}
              </span>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono-num tracking-tight">
                {formatINR(metrics.currentCashBalance)}
              </span>
            </div>

            {/* Spent progress bar */}
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono-num">
                <span className="text-zinc-400">
                  Spent to date: <strong className="text-zinc-200">{formatINR(metrics.totalExpenses)}</strong>
                </span>
                <span className="text-[#C7FF4A] font-semibold">{spentPercentage}% used</span>
              </div>
              <div className="w-full h-2 bg-[#0B0D0C] rounded-full overflow-hidden border border-[#222925]">
                <div
                  className="h-full bg-gradient-to-r from-[#C7FF4A] to-[#80E020] rounded-full transition-all duration-500"
                  style={{ width: `${spentPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Accessible Trend indicator */}
          <div className="pt-3 border-t border-[#222925] flex items-center justify-between text-xs text-zinc-400">
            <div className="flex items-center gap-1.5">
              {metrics.burnRateToDate <= metrics.targetDailyBudget ? (
                <TrendingDown className="w-4 h-4 text-[#C7FF4A]" />
              ) : (
                <TrendingUp className="w-4 h-4 text-amber-400" />
              )}
              <span>
                Burn: <strong className="text-zinc-200 font-mono-num">{formatINR(metrics.burnRateToDate)}/day</strong>
              </span>
            </div>
            <span className="text-[11px] text-zinc-500">
              Target: {formatINR(metrics.targetDailyBudget)}/day
            </span>
          </div>
        </div>

        {/* Card B: Safe-to-Spend Allowance */}
        <div className="p-6 bg-[#141816] border border-[#222925] rounded-2xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold uppercase tracking-wider">Safe-to-Spend</span>
              <span className="font-mono-num text-[11px] text-[#C7FF4A]">
                {metrics.remainingDays} days remaining
              </span>
            </div>

            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#C7FF4A] font-mono-num tracking-tight">
                {formatINR(metrics.safeToSpendPerDay)}
              </span>
              <span className="text-sm font-semibold text-zinc-400 font-mono-num">/day</span>
            </div>

            <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
              Available uncommitted cash ({formatINR(metrics.availableUncommittedCash)}) divided by {metrics.remainingDays} days left.
            </p>
          </div>

          {/* Commitment status & toggle */}
          <div className="pt-3 border-t border-[#222925] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-zinc-500" />
                Upcoming bills:
              </span>
              <span className="font-mono-num font-semibold text-zinc-300">
                {formatINR(metrics.upcomingReservedCommitments)}
              </span>
            </div>
            <button
              onClick={toggleReserveCommitments}
              className="w-full flex items-center justify-between py-1.5 px-2 bg-[#0B0D0C] hover:bg-[#191E1B] border border-[#222925] rounded-lg text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                {state.reserveUpcomingCommitments ? (
                  <Lock className="w-3 h-3 text-[#C7FF4A]" />
                ) : (
                  <Unlock className="w-3 h-3 text-zinc-500" />
                )}
                {state.reserveUpcomingCommitments ? 'Bills reserved from daily' : 'Bills not reserved from daily'}
              </span>
              <span className="text-[#C7FF4A] font-semibold">Toggle</span>
            </button>
          </div>
        </div>

        {/* Card C: Financial Health & Risk */}
        <div className="p-6 bg-[#141816] border border-[#222925] rounded-2xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold uppercase tracking-wider">Financial Health</span>
              <span
                className={`text-[11px] font-semibold uppercase tracking-wider ${
                  metrics.riskLevel === 'low'
                    ? 'text-[#C7FF4A]'
                    : metrics.riskLevel === 'moderate'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {metrics.riskTitle}
              </span>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono-num tracking-tight">
                {metrics.healthScore}
              </span>
              <span className="text-sm font-medium text-zinc-500 font-mono-num">/ 100</span>
            </div>

            {/* Health Factor mini bars */}
            <div className="mt-3 space-y-2">
              {metrics.healthFactors.map((factor) => (
                <div key={factor.name} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400 truncate">{factor.name}</span>
                    <span className="font-mono-num text-zinc-300 font-medium">
                      {factor.score}/{factor.maxScore}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-[#0B0D0C] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        factor.status === 'good'
                          ? 'bg-[#C7FF4A]'
                          : factor.status === 'warning'
                          ? 'bg-amber-400'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${(factor.score / factor.maxScore) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-[#222925] text-[11px] text-zinc-500 flex items-center justify-between">
            <span>Rule-based transparency</span>
            <button
              onClick={() => setActiveTab('insights')}
              className="text-[#C7FF4A] hover:underline flex items-center gap-1"
            >
              <span>View insights</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Section D: Month-End Forecast Chart */}
      <div className="p-6 bg-[#141816] border border-[#222925] rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#222925] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 uppercase tracking-wider font-semibold">
              <Calendar className="w-3.5 h-3.5 text-[#C7FF4A]" />
              <span>30-Day Cash Trajectory & Month-End Forecast</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              Projected Closing Balance:{' '}
              <span
                className={`font-mono-num ${
                  metrics.projectedClosingBalance >= 0 ? 'text-[#C7FF4A]' : 'text-rose-400'
                }`}
              >
                {formatINR(metrics.projectedClosingBalance)}
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono-num">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C7FF4A]" />
              <span className="text-zinc-300">Actual (Days 1–{state.currentDay})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-500" />
              <span className="text-zinc-400">Projected Run</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} aria-label="30-day cash trajectory chart showing actual and projected balances">
              <defs>
                <linearGradient id="balanceGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C7FF4A" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#C7FF4A" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                stroke="#4B5563"
                tick={{ fill: '#8E9590', fontSize: 11 }}
                interval={4}
              />
              <YAxis
                stroke="#4B5563"
                tick={{ fill: '#8E9590', fontSize: 11 }}
                tickFormatter={(v) => `₹${v}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-3 bg-[#0B0D0C] border border-[#222925] rounded-lg shadow-xl text-xs space-y-1 font-mono-num" role="tooltip">
                        <div className="font-bold text-white border-b border-[#222925] pb-1">
                          {data.label} {data.isToday ? '(Today)' : ''}
                        </div>
                        {data.actualBalance !== undefined && (
                          <div className="text-[#C7FF4A]">
                            Actual Balance: {formatINR(data.actualBalance)}
                          </div>
                        )}
                        <div className="text-zinc-300">
                          Projected Balance: {formatINR(data.projectedBalance)}
                        </div>
                        <div className="text-zinc-500">
                          Target Baseline: {formatINR(data.safeSpendBaseline)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="projectedBalance"
                stroke="#C7FF4A"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#balanceGlow)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row: Section E (Spending Breakdown) & Section F (Upcoming Commitments) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section E: Spending Breakdown */}
        <div className="p-6 bg-[#141816] border border-[#222925] rounded-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-[#222925] pb-3">
            <h2 className="text-base font-bold text-white">Spending by Category</h2>
            <button
              onClick={() => setActiveTab('budget')}
              className="text-xs font-semibold text-[#C7FF4A] hover:underline flex items-center gap-1"
            >
              <span>Adjust Budgets</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Donut Chart */}
            <div className="h-44 flex items-center justify-center">
              {categoryPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [formatINR(Number(value)), 'Spent']}
                      contentStyle={{
                        backgroundColor: '#0B0D0C',
                        borderColor: '#222925',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-zinc-500 text-center">No expenses recorded</div>
              )}
            </div>

            {/* Quick Summary of top 4 categories */}
            <div className="space-y-3">
              {Object.entries(metrics.categorySpending)
                .slice(0, 4)
                .map(([id, cat]) => {
                  const meta = CATEGORIES[id as keyof typeof CATEGORIES];
                  return (
                    <div key={id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-300 font-medium flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: meta.color }}
                          />
                          {meta.name}
                        </span>
                        <span className="font-mono-num text-zinc-400">
                          {formatINR(cat.spent)} / {formatINR(cat.allocated)}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#0B0D0C] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, cat.percentage)}%`,
                            backgroundColor: cat.percentage > 100 ? '#EF4444' : meta.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Section F: Upcoming Commitments */}
        <div className="p-6 bg-[#141816] border border-[#222925] rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#222925] pb-3">
            <div>
              <h2 className="text-base font-bold text-white">Upcoming Commitments</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Total upcoming in this cycle: <span className="text-white font-mono-num font-semibold">{formatINR(metrics.upcomingReservedCommitments)}</span>
              </p>
            </div>
            <button
              onClick={() => setActiveTab('subscriptions')}
              className="text-xs font-semibold text-[#C7FF4A] hover:underline flex items-center gap-1"
            >
              <span>Manage</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {upcomingSubscriptions.length > 0 ? (
              upcomingSubscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 bg-[#0B0D0C] border border-[#222925] rounded-xl hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#141816] border border-[#222925] flex items-center justify-center text-zinc-300">
                      <CategoryIcon name={sub.icon || sub.category} className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-zinc-200">{sub.name}</div>
                      <div className="text-[11px] text-zinc-500 font-mono-num">
                        Due on Cycle Day {sub.cycleDueDay} · in {sub.cycleDueDay - state.currentDay} days
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-white font-mono-num">
                      {formatINR(sub.amount)}
                    </div>
                    <span className="text-[10px] text-emerald-400 font-medium">Scheduled</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-zinc-500">
                No active commitments due in the remainder of this cycle.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section G: Recent Transactions List */}
      <div className="p-6 bg-[#141816] border border-[#222925] rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#222925] pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">Recent Transactions</h2>
            <span className="text-xs text-zinc-500 font-mono-num">
              ({state.transactions.length} total)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAddTx}
              className="text-xs font-semibold text-zinc-300 hover:text-white bg-[#0B0D0C] hover:bg-[#191E1B] border border-[#222925] px-3 py-1.5 rounded-lg transition-colors"
            >
              + Add Transaction
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-xs font-semibold text-[#C7FF4A] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="divide-y divide-[#222925]">
          {recentTransactions.map((tx) => {
            const isExpense = tx.type === 'expense';
            const catMeta = CATEGORIES[tx.category] || CATEGORIES.other;

            return (
              <div
                key={tx.id}
                className="py-3 flex items-center justify-between hover:bg-[#191E1B]/50 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center border border-[#222925]"
                    style={{ backgroundColor: `${catMeta.color}15` }}
                  >
                    <CategoryIcon
                      name={tx.category}
                      className="w-4 h-4"
                      style={{ color: catMeta.color }}
                    />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-zinc-200">
                      {tx.title}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                      <span>Day {tx.cycleDay}</span>
                      <span>·</span>
                      <span>{catMeta.name}</span>
                      {tx.notes && (
                        <>
                          <span>·</span>
                          <span className="hidden sm:inline truncate max-w-xs">{tx.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-xs sm:text-sm font-bold font-mono-num ${
                      isExpense ? 'text-zinc-200' : 'text-[#C7FF4A]'
                    }`}
                  >
                    {isExpense ? `-${formatINR(tx.amount)}` : `+${formatINR(tx.amount)}`}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono-num">{tx.date}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
