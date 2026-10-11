import {
  FinancialState,
  FinancialMetrics,
  HealthFactor,
  WhatIfScenario,
  SimulationResult,
  DayForecastPoint,
  CategoryId,
} from '../types/finance';
import { CATEGORY_LIST } from '../data/categories';
import { formatINR } from '../utils/formatters';

export function calculateMetrics(state: FinancialState): FinancialMetrics {
  const {
    openingBudget,
    currentDay,
    cycleTotalDays,
    transactions,
    subscriptions,
    savingsGoals,
    categoryBudgets,
    reserveUpcomingCommitments,
  } = state;

  const remainingDays = Math.max(1, cycleTotalDays - currentDay);
  const targetDailyBudget = Math.round(openingBudget / cycleTotalDays); // ₹333/day for 10000/30

  // Income & Expenses
  let totalIncome = 0;
  let totalExpenses = 0;
  const categorySpentMap: Record<CategoryId, number> = {
    food: 0,
    transport: 0,
    bills: 0,
    shopping: 0,
    entertainment: 0,
    personal_care: 0,
    emergency: 0,
    other: 0,
  };

  transactions.forEach((tx) => {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
    } else {
      totalExpenses += tx.amount;
      if (categorySpentMap[tx.category] !== undefined) {
        categorySpentMap[tx.category] += tx.amount;
      } else {
        categorySpentMap.other += tx.amount;
      }
    }
  });

  // Total saved in savings goals
  const totalSavedInGoals = savingsGoals.reduce((sum, g) => sum + g.savedAmount, 0);

  // Current Cash Balance:
  // Rule 1: opening budget + income received - expenses paid - savings transfers that leave spendable cash
  const currentCashBalance = openingBudget + totalIncome - totalExpenses - totalSavedInGoals;

  // Upcoming Active Subscriptions in this cycle (due day > currentDay and status === 'active')
  const upcomingSubscriptions = subscriptions.filter(
    (sub) => sub.status === 'active' && sub.cycleDueDay > currentDay
  );
  const upcomingReservedCommitments = upcomingSubscriptions.reduce((acc, sub) => acc + sub.amount, 0);

  // Available Uncommitted Cash
  // Rule 2: current cash - reserved upcoming commitments (if reserved by user preference)
  const effectiveReserved = reserveUpcomingCommitments ? upcomingReservedCommitments : 0;
  const availableUncommittedCash = Math.max(0, currentCashBalance - effectiveReserved);

  // Safe to Spend Per Day
  // Rule 3: max(0, available uncommitted cash / remaining days)
  const safeToSpendPerDay = Math.max(0, Math.floor(availableUncommittedCash / remainingDays));

  // Burn rate so far
  const burnRateToDate = currentDay > 0 ? Math.round(totalExpenses / currentDay) : 0;

  // Projected closing balance at current velocity
  // Discretionary spend at current burn rate: burnRateToDate * remainingDays
  // Plus upcoming active subscriptions that will trigger: upcomingReservedCommitments
  const expectedFutureSpend = burnRateToDate * remainingDays + (reserveUpcomingCommitments ? 0 : upcomingReservedCommitments);
  const projectedClosingBalance = currentCashBalance - expectedFutureSpend;

  // Category breakdown
  const categorySpending = {} as FinancialMetrics['categorySpending'];
  CATEGORY_LIST.forEach((cat) => {
    const allocated = categoryBudgets[cat.id] ?? cat.defaultAllocation;
    const spent = categorySpentMap[cat.id] || 0;
    const remaining = allocated - spent;
    const percentage = allocated > 0 ? Math.min(200, Math.round((spent / allocated) * 100)) : 0;
    categorySpending[cat.id] = { allocated, spent, remaining, percentage };
  });

  // Financial Health Scoring (Rule 8: transparent factors, 0 to 100)
  const healthFactors: HealthFactor[] = [];

  // Factor 1: Burn Rate Discipline (Max 30)
  // Target daily burn = openingBudget / 30 = 333
  let burnScore = 30;
  if (burnRateToDate <= targetDailyBudget) {
    burnScore = 30;
  } else if (burnRateToDate <= targetDailyBudget * 1.25) {
    burnScore = 24;
  } else if (burnRateToDate <= targetDailyBudget * 1.5) {
    burnScore = 16;
  } else if (burnRateToDate <= targetDailyBudget * 2.0) {
    burnScore = 8;
  } else {
    burnScore = 2;
  }
  healthFactors.push({
    name: 'Burn Rate Discipline',
    score: burnScore,
    maxScore: 30,
    status: burnScore >= 24 ? 'good' : burnScore >= 16 ? 'warning' : 'critical',
    description: `Current burn ₹${burnRateToDate}/day vs baseline target ₹${targetDailyBudget}/day.`,
  });

  // Factor 2: Survival Runway (Max 30)
  // How many days could you survive at current burn rate?
  const daysRunway = burnRateToDate > 0 ? Math.floor(currentCashBalance / burnRateToDate) : remainingDays;
  let runwayScore = 30;
  if (daysRunway >= remainingDays + 5) {
    runwayScore = 30;
  } else if (daysRunway >= remainingDays) {
    runwayScore = 26;
  } else if (daysRunway >= remainingDays * 0.75) {
    runwayScore = 18;
  } else if (daysRunway >= remainingDays * 0.5) {
    runwayScore = 10;
  } else {
    runwayScore = 3;
  }
  healthFactors.push({
    name: 'Survival Runway',
    score: runwayScore,
    maxScore: 30,
    status: runwayScore >= 24 ? 'good' : runwayScore >= 18 ? 'warning' : 'critical',
    description: `Runway of ${daysRunway} days at current spend pace with ${remainingDays} days left in cycle.`,
  });

  // Factor 3: Commitment Coverage (Max 20)
  // Ratio of current cash to upcoming commitments
  let coverageScore = 20;
  if (upcomingReservedCommitments === 0) {
    coverageScore = 20;
  } else {
    const coverageRatio = currentCashBalance / upcomingReservedCommitments;
    if (coverageRatio >= 4) coverageScore = 20;
    else if (coverageRatio >= 2) coverageScore = 16;
    else if (coverageRatio >= 1) coverageScore = 10;
    else coverageScore = 4;
  }
  healthFactors.push({
    name: 'Commitment Coverage',
    score: coverageScore,
    maxScore: 20,
    status: coverageScore >= 16 ? 'good' : coverageScore >= 10 ? 'warning' : 'critical',
    description: `₹${upcomingReservedCommitments} in upcoming commitments against ₹${currentCashBalance} cash.`,
  });

  // Factor 4: Budget Adherence (Max 20)
  // Overspent categories
  const overspentCount = Object.values(categorySpending).filter((c) => c.spent > c.allocated).length;
  let budgetScore = 20;
  if (overspentCount === 0) budgetScore = 20;
  else if (overspentCount === 1) budgetScore = 15;
  else if (overspentCount === 2) budgetScore = 10;
  else budgetScore = 4;
  healthFactors.push({
    name: 'Budget Discipline',
    score: budgetScore,
    maxScore: 20,
    status: budgetScore >= 15 ? 'good' : budgetScore >= 10 ? 'warning' : 'critical',
    description: overspentCount === 0 ? 'All 8 categories within allocated limit.' : `${overspentCount} categories exceeding allocated budget.`,
  });

  const healthScore = Math.max(5, Math.min(100, burnScore + runwayScore + coverageScore + budgetScore));

  let riskLevel: FinancialMetrics['riskLevel'] = 'low';
  let riskTitle = 'Optimal Survival Pace';
  if (healthScore >= 75) {
    riskLevel = 'low';
    riskTitle = 'Low Risk — On Track';
  } else if (healthScore >= 55) {
    riskLevel = 'moderate';
    riskTitle = 'Moderate Risk — Watch Spending';
  } else if (healthScore >= 40) {
    riskLevel = 'elevated';
    riskTitle = 'Elevated Risk — Fast Depletion';
  } else {
    riskLevel = 'critical';
    riskTitle = 'Critical Danger — Runway Alert';
  }

  return {
    openingBudget,
    totalIncome,
    totalExpenses,
    totalSavedInGoals,
    currentCashBalance,
    upcomingReservedCommitments,
    availableUncommittedCash,
    remainingDays,
    safeToSpendPerDay,
    targetDailyBudget,
    burnRateToDate,
    projectedClosingBalance,
    healthScore,
    riskLevel,
    riskTitle,
    healthFactors,
    categorySpending,
  };
}

export function generate30DayForecast(
  state: FinancialState,
  scenario?: WhatIfScenario
): DayForecastPoint[] {
  const { cycleTotalDays, currentDay, openingBudget, transactions, subscriptions, reserveUpcomingCommitments } = state;
  const metrics = calculateMetrics(state);

  // Calculate actual daily cumulative spend from transactions for days 1..currentDay
  const spendByDay: Record<number, number> = {};
  const incomeByDay: Record<number, number> = {};

  transactions.forEach((tx) => {
    const d = Math.max(1, Math.min(cycleTotalDays, tx.cycleDay));
    if (tx.type === 'expense') {
      spendByDay[d] = (spendByDay[d] || 0) + tx.amount;
    } else {
      incomeByDay[d] = (incomeByDay[d] || 0) + tx.amount;
    }
  });

  // Baseline safe spend daily slope from Day 1 (10,000 to 0)
  const baselineRate = openingBudget / cycleTotalDays;

  // Active upcoming subscriptions scheduled by day
  const upcomingSubByDay: Record<number, number> = {};
  subscriptions
    .filter((s) => s.status === 'active' && s.cycleDueDay > currentDay)
    .forEach((s) => {
      upcomingSubByDay[s.cycleDueDay] = (upcomingSubByDay[s.cycleDueDay] || 0) + s.amount;
    });

  const dailyProjectedBurn = metrics.burnRateToDate > 0 ? metrics.burnRateToDate : metrics.safeToSpendPerDay;

  // If scenario is provided, how does it affect simulation?
  let simCashDelta = 0;
  if (scenario) {
    simCashDelta = scenario.type === 'expense' ? -scenario.amount : scenario.amount;
  }

  const points: DayForecastPoint[] = [];
  let runningActualBalance = openingBudget;
  let runningProjectedBalance = metrics.currentCashBalance;
  let runningSimulatedBalance = metrics.currentCashBalance;

  for (let day = 1; day <= cycleTotalDays; day++) {
    const isPast = day < currentDay;
    const isToday = day === currentDay;
    const safeSpendBaseline = Math.max(0, Math.round(openingBudget - baselineRate * day));

    let actualBalance: number | undefined = undefined;

    if (day <= currentDay) {
      // Historical actual
      runningActualBalance = runningActualBalance + (incomeByDay[day] || 0) - (spendByDay[day] || 0);
      actualBalance = runningActualBalance;
    }

    let projectedBalance = runningActualBalance;
    if (day > currentDay) {
      const futureDayIndex = day - currentDay;
      const subCharge = upcomingSubByDay[day] || 0;
      runningProjectedBalance = Math.max(0, runningProjectedBalance - dailyProjectedBurn - subCharge);
      projectedBalance = runningProjectedBalance;
    } else {
      projectedBalance = actualBalance!;
    }

    let simulatedBalance: number | undefined = undefined;
    if (scenario) {
      if (day < scenario.proposedDay) {
        simulatedBalance = day <= currentDay ? actualBalance : projectedBalance;
      } else if (day === scenario.proposedDay) {
        simulatedBalance = (day <= currentDay ? actualBalance! : projectedBalance) + simCashDelta;
        runningSimulatedBalance = simulatedBalance;
      } else {
        const subCharge = upcomingSubByDay[day] || 0;
        runningSimulatedBalance = Math.max(0, runningSimulatedBalance - dailyProjectedBurn - subCharge);
        simulatedBalance = runningSimulatedBalance;
      }
    }

    points.push({
      day,
      label: `Day ${day}`,
      actualBalance,
      projectedBalance,
      simulatedBalance,
      safeSpendBaseline,
      isPast,
      isToday,
    });
  }

  return points;
}

export function simulateScenario(
  state: FinancialState,
  scenario: WhatIfScenario
): SimulationResult {
  const beforeMetrics = calculateMetrics(state);

  // Create a synthetic state with the hypothetical transaction
  const syntheticTx = {
    id: 'hypothetical-sim',
    title: scenario.name || 'Simulated Decision',
    amount: scenario.amount,
    type: scenario.type,
    category: scenario.category,
    cycleDay: scenario.proposedDay,
    date: '2026-10-12',
    notes: 'Hypothetical scenario',
  };

  const syntheticState: FinancialState = {
    ...state,
    transactions: [...state.transactions, syntheticTx],
  };

  const afterMetrics = calculateMetrics(syntheticState);

  const balanceDiff = afterMetrics.currentCashBalance - beforeMetrics.currentCashBalance;
  const dailyAllowanceDiff = afterMetrics.safeToSpendPerDay - beforeMetrics.safeToSpendPerDay;
  const monthEndDiff = afterMetrics.projectedClosingBalance - beforeMetrics.projectedClosingBalance;
  const healthScoreDiff = afterMetrics.healthScore - beforeMetrics.healthScore;

  // Natural language explanation as requested in spec
  let explanation = '';
  if (scenario.type === 'expense') {
    const dailyDrop = Math.abs(dailyAllowanceDiff);
    explanation = `This ${formatINR(scenario.amount)} purchase would reduce your daily allowance from ${formatINR(
      beforeMetrics.safeToSpendPerDay
    )} to ${formatINR(afterMetrics.safeToSpendPerDay)} (down ${formatINR(dailyDrop)}/day) and lower your projected month-end balance by ${formatINR(
      scenario.amount
    )}.`;
  } else {
    explanation = `This ${formatINR(scenario.amount)} extra income boosts your daily allowance from ${formatINR(
      beforeMetrics.safeToSpendPerDay
    )} to ${formatINR(afterMetrics.safeToSpendPerDay)} (up ${formatINR(dailyAllowanceDiff)}/day) and adds ${formatINR(
      scenario.amount
    )} to your survival buffer.`;
  }

  const forecast = generate30DayForecast(state, scenario);

  return {
    scenario,
    beforeMetrics,
    afterMetrics,
    balanceDiff,
    dailyAllowanceDiff,
    monthEndDiff,
    healthScoreDiff,
    explanation,
    forecast,
  };
}
