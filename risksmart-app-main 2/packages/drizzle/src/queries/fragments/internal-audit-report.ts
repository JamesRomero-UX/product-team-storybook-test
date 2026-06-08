import type { QueryConfig } from '../../db';

export const internalAuditReport = {
  columns: {
    OrgKey: false,
  },
} as const satisfies QueryConfig<'internal_audit_report'>;
