import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  FinancialState,
  FinancialMetrics,
  Transaction,
  SavingsGoal,
  Subscription,
  SubscriptionStatus,
  CategoryId,
  WhatIfScenario,
} from '../types/finance';
import { INITIAL_FINANCIAL_STATE } from '../data/initialData';
import { calculateMetrics } from '../engine/calculator';
import { formatINR } from '../utils/formatters';
import {
  validateAmount,
  validateDay,
  validateCategoryId,
  validateSubscriptionStatus,
  validateSavingsPriority,
  validateTransactionType,
} from '../utils/validation';

interface ToastState {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error' | 'warning';
}

interface FinanceContextType {
  state: FinancialState;
  metrics: FinancialMetrics;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  // Transactions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  // Budgets
  updateCategoryBudget: (category: CategoryId, amount: number) => void;
  // Savings Goals
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'savedAmount'>) => void;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  contributeToGoal: (goalId: string, amount: number) => boolean;
  withdrawFromGoal: (goalId: string, amount: number) => boolean;
  // Subscriptions
  addSubscription: (sub: Omit<Subscription, 'id'>) => void;
  updateSubscription: (id: string, updates: Partial<Subscription>) => void;
  toggleSubscriptionStatus: (id: string, newStatus: SubscriptionStatus) => void;
  deleteSubscription: (id: string) => void;
  // Commitments
  toggleReserveCommitments: () => void;
  // What-If
  applyWhatIfDecision: (scenario: WhatIfScenario) => void;
  // Sim day / Reset
  advanceDay: (newDay: number) => void;
  resetToDemo: () => void;
  // Toasts
  toasts: ToastState[];
  showToast: (message: string, type?: ToastState['type']) => void;
  dismissToast: (id: number) => void;
}

const STORAGE_KEY = 'monthly_survival_os_v1';

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<FinancialState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Basic validity check
        if (parsed.cycleTotalDays && Array.isArray(parsed.transactions)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load state from localStorage:', e);
    }
    return INITIAL_FINANCIAL_STATE;
  });

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [toasts, setToasts] = useState<ToastState[]>([]);

  // Persist state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }, [state]);

  const showToast = (message: string, type: ToastState['type'] = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Live metrics calculation
  const metrics = useMemo(() => calculateMetrics(state), [state]);

  // Transaction Actions
  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    // Validate inputs
    if (!validateTransactionType(tx.type)) {
      showToast('Invalid transaction type', 'error');
      return;
    }
    if (!validateCategoryId(tx.category)) {
      showToast('Invalid category', 'error');
      return;
    }

    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      amount: validateAmount(tx.amount) || 1,
      cycleDay: validateDay(tx.cycleDay, 1, state.cycleTotalDays),
    };

    setState((prev) => ({
      ...prev,
      transactions: [newTx, ...prev.transactions],
    }));

    showToast(
      `Added ${tx.type === 'expense' ? 'expense' : 'income'} of ${formatINR(newTx.amount)}`,
      'success'
    );
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.map((tx) =>
        tx.id === id
          ? {
              ...tx,
              ...updates,
              amount: updates.amount ? validateAmount(updates.amount) || tx.amount : tx.amount,
              cycleDay: updates.cycleDay ? validateDay(updates.cycleDay, 1, state.cycleTotalDays) : tx.cycleDay,
            }
          : tx
      ),
    }));
    showToast('Transaction updated', 'info');
  };

  const deleteTransaction = (id: string) => {
    const target = state.transactions.find((tx) => tx.id === id);
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((tx) => tx.id !== id),
    }));
    showToast(`Deleted transaction ${target ? `(${formatINR(target.amount)})` : ''}`, 'info');
  };

  // Category Budgets
  const updateCategoryBudget = (category: CategoryId, amount: number) => {
    if (!validateCategoryId(category)) {
      showToast('Invalid category', 'error');
      return;
    }
    const safeAmount = validateAmount(amount);
    setState((prev) => ({
      ...prev,
      categoryBudgets: {
        ...prev.categoryBudgets,
        [category]: safeAmount,
      },
    }));
  };

  // Savings Goals
  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id' | 'savedAmount'>) => {
    if (!validateSavingsPriority(goal.priority)) {
      showToast('Invalid priority level', 'error');
      return;
    }
    const newGoal: SavingsGoal = {
      ...goal,
      id: `goal-${Date.now()}`,
      savedAmount: 0,
      targetAmount: Math.max(10, validateAmount(goal.targetAmount)),
      targetDay: validateDay(goal.targetDay, 1, state.cycleTotalDays),
    };
    setState((prev) => ({
      ...prev,
      savingsGoals: [...prev.savingsGoals, newGoal],
    }));
    showToast(`Created savings goal: "${newGoal.name}"`, 'success');
  };

  const updateSavingsGoal = (id: string, updates: Partial<SavingsGoal>) => {
    setState((prev) => ({
      ...prev,
      savingsGoals: prev.savingsGoals.map((g) =>
        g.id === id
          ? {
              ...g,
              ...updates,
              targetAmount: updates.targetAmount ? Math.max(10, validateAmount(updates.targetAmount)) : g.targetAmount,
              targetDay: updates.targetDay ? validateDay(updates.targetDay, 1, state.cycleTotalDays) : g.targetDay,
            }
          : g
      ),
    }));
    showToast('Savings goal updated', 'info');
  };

  const deleteSavingsGoal = (id: string) => {
    const goal = state.savingsGoals.find((g) => g.id === id);
    if (!goal) return;
    // If goal had saved amount, return it to cash balance!
    setState((prev) => ({
      ...prev,
      savingsGoals: prev.savingsGoals.filter((g) => g.id !== id),
    }));
    showToast(
      goal.savedAmount > 0
        ? `Deleted goal. Released ${formatINR(goal.savedAmount)} back to available cash.`
        : 'Goal deleted',
      'info'
    );
  };

  const contributeToGoal = (goalId: string, amount: number): boolean => {
    const goal = state.savingsGoals.find((g) => g.id === goalId);
    if (!goal) return false;
    const cleanAmount = validateAmount(amount);

    if (metrics.currentCashBalance < cleanAmount) {
      showToast(
        `Insufficient available cash (${formatINR(metrics.currentCashBalance)}) to save ${formatINR(cleanAmount)}`,
        'error'
      );
      return false;
    }

    setState((prev) => ({
      ...prev,
      savingsGoals: prev.savingsGoals.map((g) =>
        g.id === goalId ? { ...g, savedAmount: g.savedAmount + cleanAmount } : g
      ),
    }));
    showToast(`Transferred ${formatINR(cleanAmount)} to "${goal.name}". Cash balance updated.`, 'success');
    return true;
  };

  const withdrawFromGoal = (goalId: string, amount: number): boolean => {
    const goal = state.savingsGoals.find((g) => g.id === goalId);
    if (!goal) return false;
    const cleanAmount = validateAmount(amount);

    if (goal.savedAmount < cleanAmount) {
      showToast(
        `Cannot withdraw more than saved in this goal (${formatINR(goal.savedAmount)})`,
        'error'
      );
      return false;
    }

    setState((prev) => ({
      ...prev,
      savingsGoals: prev.savingsGoals.map((g) =>
        g.id === goalId ? { ...g, savedAmount: g.savedAmount - cleanAmount } : g
      ),
    }));
    showToast(`Released ${formatINR(cleanAmount)} back to available cash.`, 'info');
    return true;
  };

  // Subscriptions
  const addSubscription = (sub: Omit<Subscription, 'id'>) => {
    if (!validateCategoryId(sub.category)) {
      showToast('Invalid category', 'error');
      return;
    }
    if (!validateSubscriptionStatus(sub.status)) {
      showToast('Invalid subscription status', 'error');
      return;
    }
    const newSub: Subscription = {
      ...sub,
      id: `sub-${Date.now()}`,
      amount: validateAmount(sub.amount) || 1,
      cycleDueDay: validateDay(sub.cycleDueDay, 1, state.cycleTotalDays),
    };
    setState((prev) => ({
      ...prev,
      subscriptions: [...prev.subscriptions, newSub],
    }));
    showToast(`Added subscription: ${newSub.name} (${formatINR(newSub.amount)}/mo)`, 'success');
  };

  const updateSubscription = (id: string, updates: Partial<Subscription>) => {
    setState((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.map((s) =>
        s.id === id
          ? {
              ...s,
              ...updates,
              amount: updates.amount ? validateAmount(updates.amount) || s.amount : s.amount,
              cycleDueDay: updates.cycleDueDay ? validateDay(updates.cycleDueDay, 1, state.cycleTotalDays) : s.cycleDueDay,
            }
          : s
      ),
    }));
    showToast('Subscription updated', 'info');
  };

  const toggleSubscriptionStatus = (id: string, newStatus: SubscriptionStatus) => {
    if (!validateSubscriptionStatus(newStatus)) {
      showToast('Invalid subscription status', 'error');
      return;
    }
    const sub = state.subscriptions.find((s) => s.id === id);
    if (!sub) return;
    setState((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.map((s) => (s.id === id ? { ...s, status: newStatus } : s)),
    }));

    if (newStatus === 'cancelled') {
      showToast(`Cancelled ${sub.name}. Removed future charge of ${formatINR(sub.amount)}!`, 'warning');
    } else if (newStatus === 'paused') {
      showToast(`Paused ${sub.name}. Charge put on hold.`, 'info');
    } else {
      showToast(`Resumed ${sub.name}.`, 'success');
    }
  };

  const deleteSubscription = (id: string) => {
    setState((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.filter((s) => s.id !== id),
    }));
    showToast('Subscription removed', 'info');
  };

  const toggleReserveCommitments = () => {
    setState((prev) => ({
      ...prev,
      reserveUpcomingCommitments: !prev.reserveUpcomingCommitments,
    }));
    showToast(
      state.reserveUpcomingCommitments
        ? 'Unreserved commitments from daily safe allowance'
        : 'Reserved upcoming commitments from daily safe allowance',
      'info'
    );
  };

  // What-If Apply
  const applyWhatIfDecision = (scenario: WhatIfScenario) => {
    const newTx: Transaction = {
      id: `tx-decision-${Date.now()}`,
      title: scenario.name || (scenario.type === 'expense' ? 'Simulated Expense' : 'Simulated Income'),
      amount: scenario.amount,
      type: scenario.type,
      category: scenario.category,
      cycleDay: scenario.proposedDay || state.currentDay,
      date: new Date().toISOString().split('T')[0],
      notes: scenario.notes ? `Applied from What-If Lab: ${scenario.notes}` : 'Applied from What-If Lab simulation',
      fromScenario: true,
    };

    setState((prev) => ({
      ...prev,
      transactions: [newTx, ...prev.transactions],
    }));

    showToast(
      `Applied decision! Created real ${scenario.type === 'expense' ? 'expense' : 'income'} of ${formatINR(scenario.amount)}`,
      'success'
    );
  };

  // Day Advancement for interactive exploration
  const advanceDay = (newDay: number) => {
    const bounded = Math.max(1, Math.min(state.cycleTotalDays, newDay));
    setState((prev) => ({
      ...prev,
      currentDay: bounded,
    }));
    showToast(`Simulation advanced to Day ${bounded} of ${state.cycleTotalDays}`, 'info');
  };

  // One-click Demo Reset
  const resetToDemo = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(INITIAL_FINANCIAL_STATE);
    showToast('Demo data reset to Day 12 baseline (₹10,000 budget, ₹6,750 balance)', 'info');
  };

  return (
    <FinanceContext.Provider
      value={{
        state,
        metrics,
        activeTab,
        setActiveTab,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        updateCategoryBudget,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        contributeToGoal,
        withdrawFromGoal,
        addSubscription,
        updateSubscription,
        toggleSubscriptionStatus,
        deleteSubscription,
        toggleReserveCommitments,
        applyWhatIfDecision,
        advanceDay,
        resetToDemo,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
