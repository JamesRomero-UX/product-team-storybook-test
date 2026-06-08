import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type {
  DocumentSecondLineResultInsertInput,
  ObligationSecondLineResultInsertInput,
  RiskControlledSecondLineResultInsertInput,
  RiskUncontrolledSecondLineResultInsertInput,
} from '../generated/graphql';
import { ParentTypeEnum } from '../generated/graphql';

const defaultDocumentSecondLineResult: DocumentSecondLineResultInsertInput = {
  parents: {
    data: [
      {
        ParentType: ParentTypeEnum.ComplianceMonitoringAssessment,
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

export const buildDocumentSecondLineResult = (
  overrides: Partial<DocumentSecondLineResultInsertInput> = {}
): DocumentSecondLineResultInsertInput => {
  return {
    ...defaultDocumentSecondLineResult,
    Id: randomUUID(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    OrgKey: getDefaultOrgId(),
    ...overrides,
  };
};

const defaultObligationSecondLineResult: ObligationSecondLineResultInsertInput =
  {
    CreatedAtTimestamp: undefined,
    Rationale: 'This is a rationale',
    Rating: 3,
  };

export const buildObligationSecondLineResult = (
  overrides: Partial<ObligationSecondLineResultInsertInput> = {}
): ObligationSecondLineResultInsertInput => {
  return {
    ...defaultObligationSecondLineResult,
    parents: {
      data: [
        {
          ParentType: ParentTypeEnum.ComplianceMonitoringAssessment,
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

const defaultRiskSecondLineResult: RiskControlledSecondLineResultInsertInput = {
  Likelihood: 3,
  Impact: 3,
  CreatedAtTimestamp: undefined,
  Rationale: 'This is a rationale',
  Rating: 3,
  TestDate: '2023-04-24 22:41:58.03502+00',
};

export const buildRiskControlledSecondLineResult = (
  overrides: Partial<RiskControlledSecondLineResultInsertInput> = {}
): RiskControlledSecondLineResultInsertInput => {
  return {
    ...defaultRiskSecondLineResult,
    parents: {
      data: [
        {
          ParentType: ParentTypeEnum.ComplianceMonitoringAssessment,
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

export const buildRiskUncontrolledSecondLineResult = (
  overrides: Partial<RiskUncontrolledSecondLineResultInsertInput> = {}
): RiskUncontrolledSecondLineResultInsertInput => {
  return {
    ...defaultRiskSecondLineResult,
    parents: {
      data: [
        {
          ParentType: ParentTypeEnum.ComplianceMonitoringAssessment,
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
