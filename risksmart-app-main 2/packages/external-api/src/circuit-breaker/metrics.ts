export type BreakerState = 'Closed' | 'Open' | 'HalfOpen';
export const metrics = {
  retries: 0,
  breakerTrips: 0,
  breakerResets: 0,
  halfOpens: 0,
  bulkheadRejects: 0,
  bulkheadQueueSize: 0,
  lastTrippedAt: null as string | null,
  breakerState: 'Closed' as BreakerState,
};
