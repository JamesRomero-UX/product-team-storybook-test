export const ObligationType = {
  Chapter: 'chapter',
  Rule: 'rule',
  Standard: 'standard',
  Task: 'task',
} as const;
export type ObligationType =
  (typeof ObligationType)[keyof typeof ObligationType];
