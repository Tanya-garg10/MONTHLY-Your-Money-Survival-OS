import React, { useMemo, lazy, Suspense } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR, formatPercent } from '../../utils/formatters';
import { CATEGORIES, CATEGORY_LIST } from '../../data/categories';
import { CategoryIcon } from '../common/CategoryIcon';
import { identifySavingsOpportunities } from '../../engine/calculator';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  ShieldAlert,
  ArrowRight,
  Flame,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

// Lazy load chart components
const ResponsiveContainer = lazy(() => import('recharts').then(m => ({ default: m.ResponsiveContainer })));
const BarChart = lazy(() => import('recharts').then(m => ({ default: m.BarChart })));
const Bar = lazy(() => import('recharts').then(m => ({ default: m.Bar })));
const XAxis = lazy(() => import('recharts').then(m => ({ default: m.XAxis })));
const YAxis = lazy(() => import('recharts').then(m => ({ default: m.YAxis })));
const Tooltip = lazy(() => import('recharts').then(m => ({ default: m.Tooltip })));

export const InsightsTab: React.FC = () => {
  const { state, metrics, setActiveTab } = useFinance();

  // Top spending categories sorted by spent amount
  const sortedCategories = useMemo(() => {
    return Object.entries(metrics.categorySpending)
      .map(([id, cat]) => ({
        id,
        name: CATEGORIES[id as keyof typeof CATEGORIES]?.name || id,
        color: CATEGORIES[id as keyof typeof CATEGORIES]?.color || '#94A3B8',
        ...cat,
      }))
      .sort((a, b) => b.spent - a.spent);
  }, [metrics.categorySpending]);

  const topCategory = sortedCategories[0];

  // Upcoming pressure points: upcoming bills in next 7 days
  const upcomingBillsNext7Days = useMemo(() => {
    return state.subscriptions.filter(
      (s) =>
        s.status === 'active' &&
        s.cycleDueDay > state.currentDay &&
        s.cycleDueDay <= state.currentDay + 7
    );
  }, [state.subscriptions, state.currentDay]);

  const pressureBillsTotal = upcomingBillsNext7Days.reduce((acc, b) => acc + b.amount, 0);

  // Category comparison chart data (Allocated vs Spent)
  const categoryBarData = useMemo(() => {
    return CATEGORY_LIST.map((cat) => {
      const stats = metrics.categorySpending[cat.id] || { allocated: 0, spent: 0 };
      return {
        name: cat.name.split(' ')[0], // short name
        fullName: cat.name,
        Allocated: stats.allocated,
        Spent: stats.spent,
      };
    });
  }, [metrics.categorySpending]);

  // Savings opportunities for actionable insights
  const savingsOpportunities = useMemo(() => {
    return identifySavingsOpportunities(state, metrics);
  }, [state, metrics]);

  // Rule-based dynamic recommendations based on real data
  const dynamicTips = useMemo(() => {
    const tips: {
      title: string;
      description: string;
      type: 'positive' | 'warning' | 'tip';
      actionLabel?: string;
      tab?: string;
    }[] = [];

    // Rule 1: Burn rate vs Target
    if (metrics.burnRateToDate <= metrics.targetDailyBudget) {
      tips.push({
        title: 'Spending Velocity on Target',
        description: `Your average burn rate of ${formatINR(
          metrics.burnRateToDate
        )}/day is under the baseline target of ${formatINR(
          metrics.targetDailyBudget
        )}/day. At this rate, you are on track to finish the month with ~${formatINR(
          Math.max(0, metrics.projectedClosingBalance)
        )} cash in hand.`,
        type: 'positive',
      });
    } else {
      tips.push({
        title: 'Accelerated Burn Rate Warning',
        description: `You are spending ${formatINR(
          metrics.burnRateToDate
        )}/day, which is above the target of ${formatINR(
          metrics.targetDailyBudget
        )}/day. To avoid a zero-balance before Day 30, keep daily spend under ${formatINR(
          metrics.safeToSpendPerDay
        )}/day.`,
        type: 'warning',
        actionLabel: 'Test in What-If Lab',
        tab: 'whatif',
      });
    }

    // Rule 2: Top Category focus
    if (topCategory && topCategory.spent > 0) {
      const topCatPct = metrics.totalExpenses > 0
        ? Math.round((topCategory.spent / metrics.totalExpenses) * 100)
        : 0;
      tips.push({
        title: `Dominant Spend in ${topCategory.name}`,
        description: `${topCategory.name} accounts for ${topCatPct}% of your total spending (${formatINR(
          topCategory.spent
        )}). Cooking at home or bulk grocery planning could save ₹150/day, creating a ₹2,700 surplus.`,
        type: 'tip',
        actionLabel: 'Review Budget',
        tab: 'budget',
      });
    }

    // Rule 3: Upcoming bill pressure
    if (pressureBillsTotal > 0) {
      tips.push({
        title: `Upcoming Bill Cluster (₹${pressureBillsTotal})`,
        description: `You have ${upcomingBillsNext7Days.length} bill(s) totaling ${formatINR(
          pressureBillsTotal
        )} due within the next 7 days. Consider reserving this from your daily safe-to-spend allowance.`,
        type: 'warning',
        actionLabel: 'View Subscriptions',
        tab: 'subscriptions',
      });
    } else {
      tips.push({
        title: 'Clear Runway for Next 7 Days',
        description: 'No recurring subscription payments are scheduled for the next 7 days. Perfect window to build a small buffer.',
        type: 'positive',
      });
    }

    // Rule 4: Emergency buffer
    if (metrics.totalSavedInGoals === 0) {
      tips.push({
        title: 'Zero Emergency Reserve Locked',
        description: `All your ${formatINR(
          metrics.currentCashBalance
        )} is currently in spendable cash. Transferring even ₹250 into your Month-End Cushion goal protects it from impulsive impulse taps.`,
        type: 'tip',
        actionLabel: 'Deposit Buffer',
        tab: 'savings',
      });
    }

    // Rule 5: Data-driven savings opportunity
    if (savingsOpportunities.length > 0) {
      const topOpp = savingsOpportunities[0];
      tips.push({
        title: `Target ${topOpp.categoryName} for Savings`,
        description: `Reducing ${topOpp.categoryName} spending by ${topOpp.reductionPercentage}% could save ${formatINR(topOpp.potentialSavings)}, adding ${formatINR(topOpp.dailyImpact)}/day to your safe allowance for the next ${metrics.remainingDays} days.`,
        type: 'tip',
        actionLabel: 'Review Budget',
        tab: 'budget',
      });
    }

    return tips;
  }, [
    metrics,
    topCategory,
    pressureBillsTotal,
    upcomingBillsNext7Days,
  ]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#C7FF4A] font-semibold">
          <TrendingUp className="w-4 h-4" />
          <span>Real-Time Financial Intelligence</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">Financial Insights</h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
          Mathematical diagnosis of your spending velocity, pressure points, and rule-based survival strategies.
        </p>
      </div>

      {/* KPI Diagnosis Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 bg-[#141816] border border-[#222925] rounded-xl space-y-1">
          <div className="text-xs text-zinc-400 font-medium">Daily Burn Velocity</div>
          <div className="text-2xl font-extrabold font-mono-num text-white">
            {formatINR(metrics.burnRateToDate)}
            <span className="text-xs font-normal text-zinc-400">/day</span>
          </div>
          <div className="text-[11px] text-zinc-500 font-mono-num">
            vs {formatINR(metrics.targetDailyBudget)}/day standard pace
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 bg-[#141816] border border-[#222925] rounded-xl space-y-1">
          <div className="text-xs text-zinc-400 font-medium">Safe Discretionary Ceiling</div>
          <div className="text-2xl font-extrabold font-mono-num text-[#C7FF4A]">
            {formatINR(metrics.safeToSpendPerDay)}
            <span className="text-xs font-normal text-zinc-400">/day</span>
          </div>
          <div className="text-[11px] text-zinc-500 font-mono-num">
            Over remaining {metrics.remainingDays} days
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 bg-[#141816] border border-[#222925] rounded-xl space-y-1">
          <div className="text-xs text-zinc-400 font-medium">Top Spending Drain</div>
          <div className="text-lg font-bold text-white truncate">
            {topCategory ? topCategory.name : 'None'}
          </div>
          <div className="text-[11px] text-zinc-500 font-mono-num">
            {topCategory ? `${formatINR(topCategory.spent)} spent` : '₹0'}
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 bg-[#141816] border border-[#222925] rounded-xl space-y-1">
          <div className="text-xs text-zinc-400 font-medium">Runway Status</div>
          <div
            className={`text-lg font-bold ${
              metrics.riskLevel === 'low'
                ? 'text-[#C7FF4A]'
                : metrics.riskLevel === 'moderate'
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
          >
            {metrics.riskTitle}
          </div>
          <div className="text-[11px] text-zinc-500 font-mono-num">
            Health score: {metrics.healthScore}/100
          </div>
        </div>
      </div>

      {/* Chart: Category Allocated vs Spent */}
      <div className="p-6 bg-[#141816] border border-[#222925] rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#222925] pb-3">
          <div>
            <h2 className="text-base font-bold text-white">
              Category Budget Allocation vs Actual Spent
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Identifies which budget envelopes have remaining headroom vs overspent limits.
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          <Suspense fallback={<div className="h-64 w-full flex items-center justify-center text-zinc-500 text-sm">Loading chart...</div>}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} aria-label="Category budget allocation vs actual spent comparison bar chart">
                <XAxis dataKey="name" stroke="#4B5563" tick={{ fill: '#8E9590', fontSize: 11 }} />
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
                          <div className="font-bold text-white">{data.fullName}</div>
                          <div className="text-zinc-400">Allocated: {formatINR(data.Allocated)}</div>
                          <div className="text-[#C7FF4A] font-bold">Spent: {formatINR(data.Spent)}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="Allocated" fill="#222925" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Spent" fill="#C7FF4A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Suspense>
        </div>
      </div>

      {/* Actionable Rule-Based Saving Recommendations */}
      <div className="p-6 bg-[#141816] border border-[#222925] rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#222925] pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[#C7FF4A]" />
              <span>Actionable Rule-Based Strategies</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Specific calculations derived from your ledger data to guarantee survival through Day 30.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dynamicTips.map((tip, idx) => (
            <div
              key={idx}
              className="p-5 bg-[#0B0D0C] border border-[#222925] rounded-xl space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  {tip.type === 'positive' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#C7FF4A] shrink-0" />
                  ) : tip.type === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <Lightbulb className="w-4 h-4 text-[#38BDF8] shrink-0" />
                  )}
                  <h3 className="text-sm font-bold text-zinc-100">{tip.title}</h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{tip.description}</p>
              </div>

              {tip.actionLabel && tip.tab && (
                <div className="pt-2 border-t border-[#222925]">
                  <button
                    onClick={() => setActiveTab(tip.tab!)}
                    className="text-xs font-semibold text-[#C7FF4A] hover:underline flex items-center gap-1"
                  >
                    <span>{tip.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
