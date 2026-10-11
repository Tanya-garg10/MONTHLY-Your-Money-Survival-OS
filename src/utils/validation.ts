/**
 * Validation utilities for financial data
 * Ensures data integrity and prevents invalid states
 */

export function validateAmount(amount: number): number {
  const num = Number(amount);
  if (isNaN(num) || num < 0) return 0;
  return Math.round(num);
}

export function validateDay(day: number, min: number = 1, max: number = 30): number {
  const num = Number(day);
  if (isNaN(num)) return min;
  return Math.max(min, Math.min(max, Math.round(num)));
}

export function validateId(id: string): boolean {
  return typeof id === 'string' && id.length > 0;
}

export function validateCategoryId(id: string): boolean {
  const validIds = ['food', 'transport', 'bills', 'shopping', 'entertainment', 'personal_care', 'emergency', 'other'];
  return validIds.includes(id);
}

export function validateSubscriptionStatus(status: string): boolean {
  const validStatuses = ['active', 'paused', 'cancelled'];
  return validStatuses.includes(status);
}

export function validateSavingsPriority(priority: string): boolean {
  const validPriorities = ['high', 'medium', 'low'];
  return validPriorities.includes(priority);
}

export function validateTransactionType(type: string): boolean {
  return type === 'expense' || type === 'income';
}

export function clampPercentage(value: number): number {
  return Math.max(0, Math.min(200, Math.round(value)));
}
