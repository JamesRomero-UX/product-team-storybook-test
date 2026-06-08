import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { SecondLineResultParentInsertInput } from '../generated/graphql';
import { ParentTypeEnum } from '../generated/graphql';

const secondLineResultParent: SecondLineResultParentInsertInput = {
  ParentType: ParentTypeEnum.ComplianceMonitoringAssessment,
  ResultType: ParentTypeEnum.Risk,
  CreatedAtTimestamp: new Date().toISOString(),
  ModifiedAtTimestamp: new Date().toISOString(),
};

export const buildSecondLineResultParent = (
  overrides: Partial<SecondLineResultParentInsertInput> = {}
): SecondLineResultParentInsertInput => {
  return {
    ...secondLineResultParent,
    OrgKey: getDefaultOrgId(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    ...overrides,
  };
};
