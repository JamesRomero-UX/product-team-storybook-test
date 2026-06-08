export const AcceptanceStatus = {
  AwaitingClosure: 'awaitingclosure',
  Closed: 'closed',
  Declined: 'declined',
  FirstLineApproval: 'firstlineapproval',
  Open: 'open',
  Pending: 'pending',
} as const;
export type AcceptanceStatus =
  (typeof AcceptanceStatus)[keyof typeof AcceptanceStatus];
