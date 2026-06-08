export const IssueAssessmentStatus = {
  AwaitingClosure: 'awaitingclosure',
  Closed: 'closed',
  Declined: 'declined',
  FirstLineApproval: 'firstlineapproval',
  Open: 'open',
  Pending: 'pending',
} as const;
export type IssueAssessmentStatus =
  (typeof IssueAssessmentStatus)[keyof typeof IssueAssessmentStatus];
