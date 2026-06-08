import type { QueryConfig } from '../../db';

export const issueUpdate = {
  columns: {
    OrgKey: false,
    Meta: false,
  },
} as const satisfies QueryConfig<'issue_update'>;
