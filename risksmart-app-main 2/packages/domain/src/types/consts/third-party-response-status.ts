export const ThirdPartyResponseStatus = {
  AwaitingReview: 'awaiting_review',
  Completed: 'completed',
  Expired: 'expired',
  InProgress: 'in_progress',
  NotStarted: 'not_started',
  Recalled: 'recalled',
  Rejected: 'rejected',
} as const;

export type ThirdPartyResponseStatus =
  (typeof ThirdPartyResponseStatus)[keyof typeof ThirdPartyResponseStatus];
