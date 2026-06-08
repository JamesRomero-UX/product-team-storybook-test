import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { AssessmentActivityInsertInput } from '../generated/graphql';
import {
  AssessmentActivityStatusEnum,
  AssessmentActivityTypeEnum,
} from '../generated/graphql';

const defaultAssessmentActivity: AssessmentActivityInsertInput = {
  Title: 'Title 1',
  Summary: 'Summary 1',
  ActivityType: AssessmentActivityTypeEnum.Meeting,
  Status: AssessmentActivityStatusEnum.Complete,
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
};

export const buildAssessmentActivity = (
  overrides: Partial<AssessmentActivityInsertInput> = {}
): AssessmentActivityInsertInput => {
  return {
    ...defaultAssessmentActivity,
    Id: randomUUID(),
    OrgKey: getDefaultOrgId(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    ...overrides,
  };
};
