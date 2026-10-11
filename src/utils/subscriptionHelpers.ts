import { Subscription, SubscriptionStatus } from '../types/finance';

export function filterSubscriptionsByStatus(
  subscriptions: Subscription[],
  status: SubscriptionStatus
): Subscription[] {
  return subscriptions.filter((s) => s.status === status);
}

export function filterUpcomingSubscriptions(
  subscriptions: Subscription[],
  currentDay: number
): Subscription[] {
  return subscriptions.filter(
    (s) => s.status === 'active' && s.cycleDueDay > currentDay
  );
}

export function filterUpcomingSubscriptionsInWindow(
  subscriptions: Subscription[],
  currentDay: number,
  windowDays: number
): Subscription[] {
  return subscriptions.filter(
    (s) =>
      s.status === 'active' &&
      s.cycleDueDay > currentDay &&
      s.cycleDueDay <= currentDay + windowDays
  );
}

export function calculateTotalSubscriptionAmount(
  subscriptions: Subscription[]
): number {
  return subscriptions.reduce((sum, s) => sum + s.amount, 0);
}
