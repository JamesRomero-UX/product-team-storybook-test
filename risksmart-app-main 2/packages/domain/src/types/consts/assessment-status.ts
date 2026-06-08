export const AssessmentStatus = {
  Complete: 'complete',
  InProgress: 'inprogress',
  NotStarted: 'notstarted',
} as const;

export type AssessmentStatus =
  (typeof AssessmentStatus)[keyof typeof AssessmentStatus];
