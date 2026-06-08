import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type {
  AssessmentInsertInput,
  InsertAssessmentInput,
  UpdateAssessmentInput,
} from '../generated/graphql';
import { AssessmentStatusEnum } from '../generated/graphql';

const defaultAssessment: AssessmentInsertInput = {
  Title: 'An assessment',
  Summary: 'Assessment description',
  NextTestDate: undefined,
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
  OriginatingItemId: undefined,
  Status: AssessmentStatusEnum.Inprogress,
  Outcome: 1,
};

export const buildAssessment = (
  overrides: Partial<AssessmentInsertInput> = {}
): AssessmentInsertInput => {
  return {
    ...defaultAssessment,
    Id: randomUUID(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    OrgKey: getDefaultOrgId(),
    ...overrides,
  };
};

const defaultAssessmentApi: InsertAssessmentInput = {
  OriginatingItemId: null,
  Title: 'An assessment',
  Summary: 'Assessment description',
  NextTestDate: null,
  ActualCompletionDate: null,
  StartDate: null,
  TargetCompletionDate: null,
  CompletedByUser: null,
  Status: AssessmentStatusEnum.Inprogress,
  Outcome: 1,
  ContributorGroupIds: [],
  ContributorUserIds: [],
  DepartmentTypeIds: [],
  OwnerGroupIds: [],
  OwnerUserIds: [],
  TagTypeIds: [],
};

export const buildInsertAssessmentApi = (
  overrides: Partial<InsertAssessmentInput> = {}
): InsertAssessmentInput => {
  return {
    ...defaultAssessmentApi,
    ...overrides,
  };
};

export const buildUpdateAssessmentApi = (
  overrides: Partial<UpdateAssessmentInput> = {}
): UpdateAssessmentInput => {
  return {
    Id: '',
    ...defaultAssessmentApi,
    ...overrides,
  };
};
