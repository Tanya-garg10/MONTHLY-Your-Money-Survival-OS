export type CategoryId =
  | 'food'
  | 'transport'
  | 'bills'
  | 'shopping'
  | 'entertainment'
  | 'personal_care'
  | 'emergency'
  | 'other';

export interface CategoryMeta {
  id: CategoryId;
  name: string;
  icon: string;
  color: string;
  defaultAllocation: number;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'expense' | 'income';
  category: CategoryId;
  cycleDay: number;
  date: string; // YYYY-MM-DD
  notes?: string;
  fromScenario?: boolean;
}

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'annual';
  cycleDueDay: number; // Day 1 - 30 of the cycle
  status: SubscriptionStatus;
  category: CategoryId;
  icon?: string;
  lastChargedDate?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  targetDay: number; // Day 1 - 30 of current cycle or target day
  priority: 'high' | 'medium' | 'low';
  category?: string;
  notes?: string;
}

export interface WhatIfScenario {
  id?: string;
  name: string;
  amount: number;
  type: 'expense' | 'income';
  category: CategoryId;
  isRecurring: boolean;
  recurrenceDurationMonths?: number;
  proposedDay: number;
  notes?: string;
}

export interface FinancialState {
  cycleTotalDays: number;
  currentDay: number;
  cycleStartDate: string;
  openingBudget: number;
  transactions: Transaction[];
  categoryBudgets: Record<CategoryId, number>;
  subscriptions: Subscription[];
  savingsGoals: SavingsGoal[];
  reserveUpcomingCommitments: boolean;
}

export interface HealthFactor {
  name: string;
  score: number;
  maxScore: number;
  status: 'good' | 'warning' | 'critical';
  description: string;
}

export interface FinancialMetrics {
  openingBudget: number;
  totalIncome: number;
  totalExpenses: number;
  totalSavedInGoals: number;
  currentCashBalance: number;
  upcomingReservedCommitments: number;
  availableUncommittedCash: number;
  remainingDays: number;
  safeToSpendPerDay: number;
  targetDailyBudget: number;
  burnRateToDate: number;
  projectedClosingBalance: number;
  healthScore: number;
  riskLevel: 'low' | 'moderate' | 'elevated' | 'critical';
  riskTitle: string;
  healthFactors: HealthFactor[];
  categorySpending: Record<CategoryId, {
    allocated: number;
    spent: number;
    remaining: number;
    percentage: number;
  }>;
}

export interface DayForecastPoint {
  day: number;
  actualBalance?: number;
  projectedBalance: number;
  simulatedBalance?: number;
  safeSpendBaseline: number;
  label: string;
  isPast: boolean;
  isToday: boolean;
}

export interface BudgetPressurePoint {
  categoryId: CategoryId;
  categoryName: string;
  overspentAmount: number;
  overspentPercentage: number;
  isCritical: boolean;
}

export interface SavingsOpportunity {
  categoryId: CategoryId;
  categoryName: string;
  currentSpent: number;
  potentialSavings: number;
  reductionPercentage: number;
  dailyImpact: number;
}

export interface BudgetPressurePoint {
  categoryId: CategoryId;
  categoryName: string;
  overspentAmount: number;
  overspentPercentage: number;
  isCritical: boolean;
}

export interface SavingsOpportunity {
  categoryId: CategoryId;
  categoryName: string;
  currentSpent: number;
  potentialSavings: number;
  reductionPercentage: number;
  dailyImpact: number;
}

export interface SimulationResult {
  scenario: WhatIfScenario;
  beforeMetrics: FinancialMetrics;
  afterMetrics: FinancialMetrics;
  balanceDiff: number;
  dailyAllowanceDiff: number;
  monthEndDiff: number;
  healthScoreDiff: number;
  explanation: string;
  forecast: DayForecastPoint[];
  budgetPressureBefore?: BudgetPressurePoint[];
  budgetPressureAfter?: BudgetPressurePoint[];
}
