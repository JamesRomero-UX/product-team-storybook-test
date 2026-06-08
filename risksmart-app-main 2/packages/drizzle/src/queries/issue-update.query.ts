import type { QueryConfig } from '../db';
import { issueUpdate } from './fragments/index';
import { relationFiles } from './utils';

export const getIssueUpdatesByParentIssueIdQueryConfig = {
  ...issueUpdate,
  with: {
    files: true,
    createdByUser: {
      columns: {
        FriendlyName: true,
      },
    },
  },
} as const satisfies QueryConfig<'issue_update'>;

export const getIssueUpdateByIdQueryConfig = {
  ...issueUpdate,
  with: {
    ...relationFiles,
  },
} as const satisfies QueryConfig<'issue_update'>;
