export const ActionStatus = {
  Closed: 'closed',
  Open: 'open',
  Pending: 'pending',
} as const;
export type ActionStatus = (typeof ActionStatus)[keyof typeof ActionStatus];
