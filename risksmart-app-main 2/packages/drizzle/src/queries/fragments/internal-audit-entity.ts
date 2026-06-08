import type { QueryConfig } from '../../db';

export const internalAuditEntity = {
  columns: {
    OrgKey: false,
  },
} as const satisfies QueryConfig<'internal_audit_entity'>;
