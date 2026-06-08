import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type {
  ImpactRatingInsertInput,
  InsertChildImpactRatingMutationVariables,
} from '../generated/graphql';

const defaultImpactRating: ImpactRatingInsertInput = {
  Rating: 3,
  TestDate: '2021-01-02',
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
};

export const buildImpactRating = (
  overrides: Partial<ImpactRatingInsertInput> = {}
): ImpactRatingInsertInput => {
  return {
    ...defaultImpactRating,
    OrgKey: getDefaultOrgId(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    CompletedBy: getDefaultUserId(),
    Id: randomUUID(),
    ...overrides,
  };
};

const defaultChildImpactRating: InsertChildImpactRatingMutationVariables = {
  RatedItemId: '',
  Ratings: [
    {
      ImpactId: '',
      Rating: 3,
    },
  ],
  TestDate: '2021-01-02',
  CompletedBy: getDefaultUserId(),
};

export const buildChildImpactRating = (
  overrides: Partial<InsertChildImpactRatingMutationVariables> = {}
): InsertChildImpactRatingMutationVariables => {
  return {
    ...defaultChildImpactRating,
    ...overrides,
  };
};
