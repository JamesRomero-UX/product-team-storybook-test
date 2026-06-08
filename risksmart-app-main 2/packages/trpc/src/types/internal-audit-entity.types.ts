import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getInternalAuditByIdQueryConfig,
  getInternalAuditEntityRegisterQueryConfig,
} from '@risksmart-app/drizzle/src/queries/internal-audit-entity.query';

import type { GetFormConfigurationResponseRow } from './index';

export type InternalAuditEntityRegisterResponseRow = InferQueryModel<
  'internal_audit_entity',
  typeof getInternalAuditEntityRegisterQueryConfig
>;

export type InternalAuditByIdResponseRow = InferQueryModel<
  'internal_audit_entity',
  typeof getInternalAuditByIdQueryConfig
>;

export interface InternalAuditByIdResponse {
  internal_audit_entity: InternalAuditByIdResponseRow[];
  form_configuration?: GetFormConfigurationResponseRow | null | undefined;
}
