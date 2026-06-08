import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { InternalAuditReportInsertInput } from '../generated/graphql';
import { AssessmentStatusEnum } from '../generated/graphql';

const defaultInternalAuditReport: InternalAuditReportInsertInput = {
  Title: 'An internal audit report',
  Summary: 'Assessment description',
  NextTestDate: undefined,
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
  OriginatingItemId: undefined,
  Status: AssessmentStatusEnum.Inprogress,
  Outcome: 1,
};

export const buildInternalAuditReport = (
  overrides: Partial<InternalAuditReportInsertInput> = {}
): InternalAuditReportInsertInput => {
  return {
    ...defaultInternalAuditReport,
    Id: randomUUID(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    OrgKey: getDefaultOrgId(),
    ...overrides,
  };
};
