import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { AssessmentResultParentInsertInput } from '../generated/graphql';
import { ParentTypeEnum } from '../generated/graphql';

const assessmentResultParent: AssessmentResultParentInsertInput = {
  ParentType: ParentTypeEnum.Assessment,
  ResultType: ParentTypeEnum.Risk,
  CreatedAtTimestamp: new Date().toISOString(),
  ModifiedAtTimestamp: new Date().toISOString(),
};

export const buildAssessmentResultParent = (
  overrides: Partial<AssessmentResultParentInsertInput> = {}
): AssessmentResultParentInsertInput => {
  return {
    ...assessmentResultParent,
    OrgKey: getDefaultOrgId(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    ...overrides,
  };
};
