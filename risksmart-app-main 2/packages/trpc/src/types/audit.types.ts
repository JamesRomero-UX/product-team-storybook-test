import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getAcceptanceAuditByIdQueryConfig,
  getActionAuditByIdQueryConfig,
} from '@risksmart-app/drizzle/src/queries/audit.query';

export type AcceptanceAuditByIdResponseRow = InferQueryModel<
  'acceptance_audit',
  typeof getAcceptanceAuditByIdQueryConfig
>;

export type ActionAuditByIdResponseRow = InferQueryModel<
  'action_audit',
  typeof getActionAuditByIdQueryConfig
>;
