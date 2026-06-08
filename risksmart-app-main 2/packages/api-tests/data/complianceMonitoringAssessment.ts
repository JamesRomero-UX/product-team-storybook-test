import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { ComplianceMonitoringAssessmentInsertInput } from '../generated/graphql';
import { AssessmentStatusEnum } from '../generated/graphql';

const defaultComplianceMonitoringAssessment: ComplianceMonitoringAssessmentInsertInput =
  {
    Title: 'An internal audit report',
    Summary: 'Assessment description',
    NextTestDate: undefined,

    CreatedAtTimestamp: undefined,
    ModifiedAtTimestamp: undefined,
    OriginatingItemId: undefined,
    Status: AssessmentStatusEnum.Inprogress,
    Outcome: 1,
  };

export const buildComplianceMonitoringAssessment = (
  overrides: Partial<ComplianceMonitoringAssessmentInsertInput> = {}
): ComplianceMonitoringAssessmentInsertInput => {
  return {
    ...defaultComplianceMonitoringAssessment,
    Id: randomUUID(),
    OrgKey: getDefaultOrgId(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    ...overrides,
  };
};
