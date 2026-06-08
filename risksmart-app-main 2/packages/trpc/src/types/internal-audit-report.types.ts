import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getInternalAuditReportByIdQueryConfig,
  getInternalAuditReportByOriginatingItemIdQueryConfig,
  getInternalAuditReportRegisterQueryConfig,
} from '@risksmart-app/drizzle/src/queries/internal-audit-report.query';

import type { GetFormConfigurationResponseRow } from './index';

export type InternalAuditReportRegisterResponseRow = InferQueryModel<
  'internal_audit_report',
  typeof getInternalAuditReportRegisterQueryConfig
>;

export type InternalAuditReportsByOriginatingItemIdResponseRow =
  InferQueryModel<
    'internal_audit_report',
    typeof getInternalAuditReportByOriginatingItemIdQueryConfig
  >;

export interface InternalAuditReportsByOriginatingItemIdResponse {
  internal_audit_report: InternalAuditReportsByOriginatingItemIdResponseRow[];
  form_configuration?: GetFormConfigurationResponseRow | null | undefined;
}

export type InternalAuditReportByIdResponseRow = InferQueryModel<
  'internal_audit_report',
  typeof getInternalAuditReportByIdQueryConfig
>;
