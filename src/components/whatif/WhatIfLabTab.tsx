import React, { useState, useMemo, lazy, Suspense } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { WhatIfScenario, CategoryId } from '../../types/finance';
import { CATEGORY_LIST, CATEGORIES } from '../../data/categories';
import { simulateScenario } from '../../engine/calculator';
import { formatINR } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import {
  FlaskConical,
  Sparkles,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Calendar,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  Info,
} from 'lucide-react';

// Lazy load chart components
const ResponsiveContainer = lazy(() => import('recharts').then(m => ({ default: m.ResponsiveContainer })));
const LineChart = lazy(() => import('recharts').then(m => ({ default: m.LineChart })));
const Line = lazy(() => import('recharts').then(m => ({ default: m.Line })));
const XAxis = lazy(() => import('recharts').then(m => ({ default: m.XAxis })));
const YAxis = lazy(() => import('recharts').then(m => ({ default: m.YAxis })));
const Tooltip = lazy(() => import('recharts').then(m => ({ default: m.Tooltip })));

interface PresetScenario {
  label: string;
  scenario: WhatIfScenario;
  desc: string;
}

export const WhatIfLabTab: React.FC = () => {
  const { state, metrics, applyWhatIfDecision } = useFinance();

  // Active scenario under test
  const [scenarioName, setScenarioName] = useState('Concert Ticket with Friends');
  const [amount, setAmount] = useState<number>(1200);
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState<CategoryId>('entertainment');
  const [isRecurring, setIsRecurring] = useState(false);
  const [proposedDay, setProposedDay] = useState<number>(state.currentDay);
  const [notes, setNotes] = useState('');

  // Quick simulation presets
  const presets: PresetScenario[] = [
    {
      label: 'Concert / Weekend Out',
      desc: 'Going to live event with friends',
      scenario: {
        name: 'Concert Ticket & Weekend Out',
        amount: 1200,
        type: 'expense',
        category: 'entertainment',
        isRecurring: false,
        proposedDay: state.currentDay,
      },
    },
    {
      label: 'Earbuds Purchase',
      desc: 'Buy noise cancelling earbuds on sale',
      scenario: {
        name: 'Noise Cancelling Wireless Earbuds',
        amount: 2200,
        type: 'expense',
        category: 'shopping',
        isRecurring: false,
        proposedDay: state.currentDay,
      },
    },
    {
      label: 'Unexpected Clinic / Repair',
      desc: 'Dental appointment or scooter tyre puncture',
      scenario: {
        name: 'Urgent Clinic Visit & Medicines',
        amount: 850,
        type: 'expense',
        category: 'personal_care',
        isRecurring: false,
        proposedDay: state.currentDay,
      },
    },
    {
      label: 'Late Night Swiggy Delivery',
      desc: 'Midnight cravings with cheese burgers',
      scenario: {
        name: 'Late Night Swiggy Cravings',
        amount: 450,
        type: 'expense',
        category: 'food',
        isRecurring: false,
        proposedDay: state.currentDay,
      },
    },
    {
      label: 'Freelance Design Gig',
      desc: 'Completed campus graphic design project',
      scenario: {
        name: 'Freelance Design Gig Payout',
        amount: 2000,
        type: 'income',
        category: 'other',
        isRecurring: false,
        proposedDay: state.currentDay,
      },
    },
  ];

  const currentScenario: WhatIfScenario = useMemo(
    () => ({
      name: scenarioName,
      amount: Math.max(1, amount),
      type,
      category,
      isRecurring,
      proposedDay,
      notes,
    }),
    [scenarioName, amount, type, category, isRecurring, proposedDay, notes]
  );

  // Live simulation results calculated from pure calculator engine
  const simResult = useMemo(
    () => simulateScenario(state, currentScenario),
    [state, currentScenario]
  );

  const handleApplyPreset = (p: PresetScenario) => {
    setScenarioName(p.scenario.name);
    setAmount(p.scenario.amount);
    setType(p.scenario.type);
    setCategory(p.scenario.category);
    setIsRecurring(p.scenario.isRecurring);
    setProposedDay(p.scenario.proposedDay);
    setNotes(p.desc);
  };

  const handleDiscard = () => {
    setScenarioName('Concert Ticket with Friends');
    setAmount(1200);
    setType('expense');
    setCategory('entertainment');
    setIsRecurring(false);
    setProposedDay(state.currentDay);
    setNotes('');
  };

  const handleApplyToRealData = () => {
    applyWhatIfDecision(currentScenario);
  };

  const { beforeMetrics, afterMetrics, explanation, forecast } = simResult;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#C7FF4A] font-semibold">
            <FlaskConical className="w-4 h-4" />
            <span>Interactive Decision Simulator</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">What-If Lab</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Test any purchase, surprise expense, or income before spending a single rupee. Zero risk, 100% mathematical certainty.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDiscard}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#141816] hover:bg-[#191E1B] border border-[#222925] text-xs font-semibold text-zinc-400 hover:text-white rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Discard</span>
          </button>
          <button
            onClick={handleApplyToRealData}
            className="flex items-center gap-2 px-4 py-2 bg-[#C7FF4A] hover:bg-[#b5ee3a] text-black font-extrabold text-xs sm:text-sm rounded-lg transition-all shadow-lg hover:shadow-[#C7FF4A]/20"
          >
            <span>Apply this decision</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Scenario Preset Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs text-zinc-500 font-semibold shrink-0 uppercase tracking-wider">
          Presets:
        </span>
        {presets.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleApplyPreset(p)}
            className="px-3 py-1.5 bg-[#141816] hover:bg-[#191E1B] border border-[#222925] hover:border-[#C7FF4A]/40 rounded-lg text-xs font-medium text-zinc-300 hover:text-white shrink-0 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-[#C7FF4A]" />
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Simulator Inputs Card */}
      <div className="p-6 bg-[#141816] border border-[#222925] rounded-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-[#222925] pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Configure Simulated Decision</span>
          </h2>
          <span className="text-xs text-[#C7FF4A] bg-[#C7FF4A]/10 border border-[#C7FF4A]/30 px-2 py-0.5 rounded-full font-mono-num font-semibold">
            Hypothetical Sandbox
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Decision Name */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Scenario Name
            </label>
            <input
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0B0D0C] border border-[#222925] focus:border-[#C7FF4A] rounded-lg text-sm text-white font-medium outline-none"
              placeholder="e.g. New jacket, Weekend roadtrip..."
            />
          </div>

          {/* Type Toggle */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Type
            </label>
            <div className="grid grid-cols-2 p-1 bg-[#0B0D0C] border border-[#222925] rounded-lg">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  type === 'expense'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  type === 'income'
                    ? 'bg-[#C7FF4A]/20 text-[#C7FF4A] border border-[#C7FF4A]/40'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryId)}
              className="w-full px-3 py-2 bg-[#0B0D0C] border border-[#222925] focus:border-[#C7FF4A] text-xs text-white rounded-lg outline-none cursor-pointer"
            >
              {CATEGORY_LIST.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Amount Slider and Numeric Control */}
        <div className="space-y-3 pt-2 border-t border-[#222925]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-400">
              Simulated Amount: <strong className="text-white font-mono-num">{formatINR(amount)}</strong>
            </label>
            <div className="flex items-center gap-1 font-mono-num">
              <span className="text-zinc-500 text-xs">₹</span>
              <input
                type="number"
                min="1"
                step="50"
                value={amount === 0 ? '' : amount}
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value));
                  setAmount(val);
                }}
                onBlur={() => {
                  if (amount <= 0) setAmount(100);
                }}
                className="w-24 px-2 py-1 bg-[#0B0D0C] border border-[#222925] rounded text-right text-sm font-bold text-[#C7FF4A] outline-none focus:border-[#C7FF4A]"
              />
            </div>
          </div>

          <input
            type="range"
            min="50"
            max="6000"
            step="50"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full h-2 bg-[#0B0D0C] rounded-lg appearance-none cursor-pointer accent-[#C7FF4A]"
          />

          {/* Quick Amount Step Buttons */}
          <div className="flex items-center gap-2">
            {[200, 500, 1000, 1500, 2500, 5000].map((step) => (
              <button
                key={step}
                onClick={() => setAmount(step)}
                className={`px-2.5 py-1 text-[11px] font-mono-num rounded-md border transition-colors ${
                  amount === step
                    ? 'border-[#C7FF4A] bg-[#C7FF4A]/10 text-white'
                    : 'border-[#222925] bg-[#0B0D0C] text-zinc-400 hover:text-white'
                }`}
              >
                ₹{step}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Real-Time Natural Language Impact Callout */}
      <div className="p-5 bg-[#141816] border border-[#C7FF4A]/40 rounded-2xl relative overflow-hidden space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#C7FF4A] uppercase tracking-wider font-mono-num">
          <Info className="w-4 h-4" />
          <span>Real-time Financial Impact Analysis</span>
        </div>
        <p className="text-sm sm:text-base text-zinc-100 font-medium leading-relaxed">
          {explanation}
        </p>
        <div className="pt-2 border-t border-[#C7FF4A]/20 text-xs text-zinc-400">
          <span className="font-semibold text-zinc-300">Key Insight:</span> This decision{' '}
          {type === 'expense' ? (
            <span className="text-rose-400">
              reduces your survival runway by {Math.round(amount / afterMetrics.safeToSpendPerDay)} days
            </span>
          ) : (
            <span className="text-[#C7FF4A]">
              extends your survival runway by {Math.round(amount / afterMetrics.safeToSpendPerDay)} days
            </span>
          )}{' '}
          at current spending pace.
        </div>
      </div>

      {/* Live Before vs After Comparison Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Cash Balance */}
        <div className="p-5 bg-[#141816] border border-[#222925] rounded-xl space-y-3">
          <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
            Available Balance
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] text-zinc-500">Before</div>
              <div className="text-lg font-bold font-mono-num text-zinc-300">
                {formatINR(beforeMetrics.currentCashBalance)}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500" />
            <div className="text-right">
              <div className="text-[11px] text-zinc-500">After</div>
              <div className="text-xl font-extrabold font-mono-num text-white">
                {formatINR(afterMetrics.currentCashBalance)}
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-[#222925] text-xs font-mono-num text-zinc-400 flex items-center justify-between">
            <span>Change</span>
            <span
              className={
                type === 'expense' ? 'text-rose-400 font-bold' : 'text-[#C7FF4A] font-bold'
              }
            >
              {type === 'expense' ? `-${formatINR(amount)}` : `+${formatINR(amount)}`}
            </span>
          </div>
        </div>

        {/* Metric 2: Daily Safe-to-Spend */}
        <div className="p-5 bg-[#141816] border border-[#222925] rounded-xl space-y-3">
          <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
            Daily Safe Allowance
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] text-zinc-500">Before</div>
              <div className="text-lg font-bold font-mono-num text-zinc-300">
                {formatINR(beforeMetrics.safeToSpendPerDay)}/d
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500" />
            <div className="text-right">
              <div className="text-[11px] text-zinc-500">After</div>
              <div className="text-xl font-extrabold font-mono-num text-[#C7FF4A]">
                {formatINR(afterMetrics.safeToSpendPerDay)}/d
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-[#222925] text-xs font-mono-num text-zinc-400 flex items-center justify-between">
            <span>Daily Belt</span>
            <span
              className={
                afterMetrics.safeToSpendPerDay < beforeMetrics.safeToSpendPerDay
                  ? 'text-rose-400 font-bold'
                  : 'text-[#C7FF4A] font-bold'
              }
            >
              {afterMetrics.safeToSpendPerDay - beforeMetrics.safeToSpendPerDay > 0 ? '+' : ''}
              {formatINR(afterMetrics.safeToSpendPerDay - beforeMetrics.safeToSpendPerDay)}/d
            </span>
          </div>
        </div>

        {/* Metric 3: Month-End Forecast */}
        <div className="p-5 bg-[#141816] border border-[#222925] rounded-xl space-y-3">
          <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
            Month-End Projected
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] text-zinc-500">Before</div>
              <div className="text-lg font-bold font-mono-num text-zinc-300">
                {formatINR(beforeMetrics.projectedClosingBalance)}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500" />
            <div className="text-right">
              <div className="text-[11px] text-zinc-500">After</div>
              <div
                className={`text-xl font-extrabold font-mono-num ${
                  afterMetrics.projectedClosingBalance >= 0 ? 'text-white' : 'text-rose-400'
                }`}
              >
                {formatINR(afterMetrics.projectedClosingBalance)}
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-[#222925] text-xs font-mono-num text-zinc-400 flex items-center justify-between">
            <span>Buffer Impact</span>
            <span
              className={
                type === 'expense' ? 'text-rose-400 font-bold' : 'text-[#C7FF4A] font-bold'
              }
            >
              {type === 'expense' ? `-${formatINR(amount)}` : `+${formatINR(amount)}`}
            </span>
          </div>
        </div>

        {/* Metric 4: Health Score */}
        <div className="p-5 bg-[#141816] border border-[#222925] rounded-xl space-y-3">
          <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
            Health & Risk
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] text-zinc-500">Score</div>
              <div className="text-lg font-bold font-mono-num text-zinc-300">
                {beforeMetrics.healthScore}/100
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500" />
            <div className="text-right">
              <div className="text-[11px] text-zinc-500">Simulated</div>
              <div
                className={`text-xl font-extrabold font-mono-num ${
                  afterMetrics.healthScore >= 75
                    ? 'text-[#C7FF4A]'
                    : afterMetrics.healthScore >= 50
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {afterMetrics.healthScore}/100
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-[#222925] text-xs text-zinc-400 flex items-center justify-between">
            <span>Risk Level</span>
            <span
              className={`font-semibold ${
                afterMetrics.riskLevel === 'low'
                  ? 'text-[#C7FF4A]'
                  : afterMetrics.riskLevel === 'moderate'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {afterMetrics.riskTitle}
            </span>
          </div>
        </div>
      </div>

      {/* Balance-Over-Time Comparison Chart */}
      <div className="p-6 bg-[#141816] border border-[#222925] rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#222925] pb-3">
          <div>
            <h2 className="text-base font-bold text-white">
              Baseline vs Simulated Trajectory (Days 1–30)
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Visualizes how this hypothetical decision alters your cash curve through Day 30.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono-num">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
              <span className="text-zinc-300">Baseline Forecast</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C7FF4A]" />
              <span className="text-[#C7FF4A] font-bold">Simulated Trajectory</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <Suspense fallback={<div className="h-full flex items-center justify-center text-zinc-500 text-sm">Loading chart...</div>}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                        <div className="p-3 bg-[#0B0D0C] border border-[#222925] rounded-lg shadow-xl text-xs space-y-1 font-mono-num">
                          <div className="font-bold text-white border-b border-[#222925] pb-1">
                            {data.label}
                          </div>
                          <div className="text-zinc-400">
                            Baseline: {formatINR(data.projectedBalance)}
                          </div>
                          {data.simulatedBalance !== undefined && (
                            <div className="text-[#C7FF4A] font-bold">
                              Simulated: {formatINR(data.simulatedBalance)}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="projectedBalance"
                  stroke="#6B7280"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="simulatedBalance"
                  stroke="#C7FF4A"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Suspense>
        </div>
      </div>
    </div>
  );
};
