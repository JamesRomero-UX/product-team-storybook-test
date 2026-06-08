import type { QueryConfig } from '../../db';

export const issueUpdateAudit = {
  columns: {
    OrgKey: false,
    Meta: false,
  },
} as const satisfies QueryConfig<'issue_update_audit'>;
