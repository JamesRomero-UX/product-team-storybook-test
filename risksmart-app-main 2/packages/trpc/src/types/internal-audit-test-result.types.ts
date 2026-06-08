import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getInternalAuditTestResultByIdQueryConfig } from '@risksmart-app/drizzle/src/queries/internal-audit-test-result.query';

export type InternalAuditTestResultByIdResponse = InferQueryModel<
  'control_test_internal_audit_result',
  typeof getInternalAuditTestResultByIdQueryConfig
>;
