import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type {
  DocumentAssessmentResultInsertInput,
  ObligationAssessmentResultInsertInput,
  RiskAssessmentResultInsertInput,
} from '../generated/graphql';
import {
  ParentTypeEnum,
  RiskAssessmentResultControlTypeEnum,
} from '../generated/graphql';

const defaultDocumentAssessmentResult: DocumentAssessmentResultInsertInput = {
  parents: {
    data: [
      {
        ParentType: ParentTypeEnum.Assessment,
        ResultType: ParentTypeEnum.Document,
        OrgKey: getDefaultOrgId(),
        CreatedByUser: getDefaultUserId(),
        CreatedAtTimestamp: new Date().toISOString(),
        ModifiedByUser: getDefaultUserId(),
        ModifiedAtTimestamp: new Date().toISOString(),
      },
      {
        ParentType: ParentTypeEnum.Document,
        ResultType: ParentTypeEnum.Document,
        OrgKey: getDefaultOrgId(),
        CreatedByUser: getDefaultUserId(),
        CreatedAtTimestamp: new Date().toISOString(),
        ModifiedByUser: getDefaultUserId(),
        ModifiedAtTimestamp: new Date().toISOString(),
      },
    ],
  },

  CreatedAtTimestamp: undefined,

  Rating: 3,
  Rationale: 'This is a rationale',
  TestDate: '2021-09-01',
};

export const buildDocumentAssessmentResult = (
  overrides: Partial<DocumentAssessmentResultInsertInput> = {}
): DocumentAssessmentResultInsertInput => {
  return {
    ...defaultDocumentAssessmentResult,
    Id: randomUUID(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    OrgKey: getDefaultOrgId(),
    ...overrides,
  };
};

const defaultObligationAssessmentResult: ObligationAssessmentResultInsertInput =
  {
    CreatedAtTimestamp: undefined,
    Rationale: 'This is a rationale',
    Rating: 3,
  };

export const buildObligationAssessmentResult = (
  overrides: Partial<ObligationAssessmentResultInsertInput> = {}
): ObligationAssessmentResultInsertInput => {
  return {
    ...defaultObligationAssessmentResult,
    parents: {
      data: [
        {
          ParentType: ParentTypeEnum.Assessment,
          ResultType: ParentTypeEnum.Obligation,
          OrgKey: getDefaultOrgId(),
          CreatedByUser: getDefaultUserId(),
          CreatedAtTimestamp: new Date().toISOString(),
          ModifiedByUser: getDefaultUserId(),
          ModifiedAtTimestamp: new Date().toISOString(),
        },
        {
          ParentType: ParentTypeEnum.Obligation,
          ResultType: ParentTypeEnum.Obligation,
          OrgKey: getDefaultOrgId(),
          CreatedByUser: getDefaultUserId(),
          CreatedAtTimestamp: new Date().toISOString(),
          ModifiedByUser: getDefaultUserId(),
          ModifiedAtTimestamp: new Date().toISOString(),
        },
      ],
    },
    Id: randomUUID(),
    OrgKey: getDefaultOrgId(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    ...overrides,
  };
};

const defaultRiskAssessmentResult: RiskAssessmentResultInsertInput = {
  ControlType: RiskAssessmentResultControlTypeEnum.Controlled,
  Likelihood: 3,
  Impact: 3,
  CreatedAtTimestamp: undefined,
  Rationale: 'This is a rationale',
  Rating: 3,
  TestDate: '2023-04-24 22:41:58.03502+00',
};

export const buildRiskAssessmentResult = (
  overrides: Partial<RiskAssessmentResultInsertInput> = {}
): RiskAssessmentResultInsertInput => {
  return {
    ...defaultRiskAssessmentResult,
    parents: {
      data: [
        {
          ParentType: ParentTypeEnum.Assessment,
          ResultType: ParentTypeEnum.Risk,
          OrgKey: getDefaultOrgId(),
          CreatedByUser: getDefaultUserId(),
          CreatedAtTimestamp: new Date().toISOString(),
          ModifiedByUser: getDefaultUserId(),
          ModifiedAtTimestamp: new Date().toISOString(),
        },
        {
          ParentType: ParentTypeEnum.Risk,
          ResultType: ParentTypeEnum.Risk,
          OrgKey: getDefaultOrgId(),
          CreatedByUser: getDefaultUserId(),
          CreatedAtTimestamp: new Date().toISOString(),
          ModifiedByUser: getDefaultUserId(),
          ModifiedAtTimestamp: new Date().toISOString(),
        },
      ],
    },
    Id: randomUUID(),
    OrgKey: getDefaultOrgId(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    ...overrides,
  };
};
