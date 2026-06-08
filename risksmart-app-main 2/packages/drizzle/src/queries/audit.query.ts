import type { QueryConfig } from '../db';

export const getAcceptanceAuditByIdQueryConfig = {
  columns: {
    OrgKey: false,
    Meta: false,
  },
} as const satisfies QueryConfig<'acceptance_audit'>;

export const getActionAuditByIdQueryConfig = {
  columns: {
    OrgKey: false,
    Meta: false,
  },
} as const satisfies QueryConfig<'action_audit'>;
