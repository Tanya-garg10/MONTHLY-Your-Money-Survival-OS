import { CategoryId } from '../types/finance';

export interface BudgetPreset {
  name: string;
  allocations: Record<CategoryId, number>;
}

export const BUDGET_PRESETS: Record<string, BudgetPreset> = {
  default: {
    name: 'Default Allocations',
    allocations: {
      food: 3500,
      transport: 1200,
      bills: 1800,
      shopping: 1000,
      entertainment: 800,
      personal_care: 700,
      emergency: 600,
      other: 400,
    },
  },
  survival: {
    name: 'Strict Survival',
    allocations: {
      food: 4200,
      transport: 1000,
      bills: 2000,
      shopping: 400,
      entertainment: 500,
      personal_care: 500,
      emergency: 1000,
      other: 400,
    },
  },
  balanced: {
    name: 'Balanced',
    allocations: {
      food: 3400,
      transport: 1200,
      bills: 1800,
      shopping: 1000,
      entertainment: 900,
      personal_care: 700,
      emergency: 600,
      other: 400,
    },
  },
};

export function applyBudgetPreset(
  presetKey: string,
  updateCategoryBudget: (category: CategoryId, amount: number) => void
): void {
  const preset = BUDGET_PRESETS[presetKey];
  if (!preset) return;

  Object.entries(preset.allocations).forEach(([category, amount]) => {
    updateCategoryBudget(category as CategoryId, amount);
  });
}
