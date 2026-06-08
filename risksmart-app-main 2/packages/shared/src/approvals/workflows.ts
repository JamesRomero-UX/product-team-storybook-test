import type { ParentType } from '@risksmart-app/domain/src/types/consts';

export const workflows = {
  document: ['publish-document-version'],
  risk: [
    'update-risk-details',
    'open-acceptance',
    'delete-acceptance',
    'delete-risk',
  ],
  control: ['delete-control', 'update-control-details'],
  issue: [
    'delete-issue',
    'close-issue-assessment',
    'update-issue-assessment-target-close-date',
  ],
  action: [
    'close-action',
    'delete-action',
    'update-action-details',
    'update-action-target-close-date',
  ],
} as const satisfies Partial<Record<ParentType, readonly string[]>>;

export type WorkflowId = (typeof workflows)[keyof typeof workflows][number];
