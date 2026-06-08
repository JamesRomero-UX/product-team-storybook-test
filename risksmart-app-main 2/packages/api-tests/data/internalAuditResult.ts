import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type {
  DocumentInternalAuditResultInsertInput,
  ObligationInternalAuditResultInsertInput,
  RiskControlledInternalAuditResultInsertInput,
  RiskUncontrolledInternalAuditResultInsertInput,
} from '../generated/graphql';
import { ParentTypeEnum } from '../generated/graphql';

const defaultDocumentInternalAuditResult: DocumentInternalAuditResultInsertInput =
  {
    parents: {
      data: [
        {
          ParentType: ParentTypeEnum.InternalAuditReport,
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

export const buildDocumentInternalAuditResult = (
  overrides: Partial<DocumentInternalAuditResultInsertInput> = {}
): DocumentInternalAuditResultInsertInput => {
  return {
    ...defaultDocumentInternalAuditResult,
    Id: randomUUID(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    OrgKey: getDefaultOrgId(),
    ...overrides,
  };
};

const defaultObligationInternalAuditResult: ObligationInternalAuditResultInsertInput =
  {
    CreatedAtTimestamp: undefined,
    Rationale: 'This is a rationale',
    Rating: 3,
  };

export const buildObligationInternalAuditResult = (
  overrides: Partial<ObligationInternalAuditResultInsertInput> = {}
): ObligationInternalAuditResultInsertInput => {
  return {
    ...defaultObligationInternalAuditResult,
    parents: {
      data: [
        {
          ParentType: ParentTypeEnum.InternalAuditReport,
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

const defaultRiskInternalAuditResult: RiskControlledInternalAuditResultInsertInput =
  {
    Likelihood: 3,
    Impact: 3,
    CreatedAtTimestamp: undefined,
    Rationale: 'This is a rationale',
    Rating: 3,
    TestDate: '2023-04-24 22:41:58.03502+00',
  };

export const buildRiskControlledInternalAuditResult = (
  overrides: Partial<RiskControlledInternalAuditResultInsertInput> = {}
): RiskControlledInternalAuditResultInsertInput => {
  return {
    ...defaultRiskInternalAuditResult,
    parents: {
      data: [
        {
          ParentType: ParentTypeEnum.InternalAuditReport,
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

export const buildRiskUncontrolledInternalAuditResult = (
  overrides: Partial<RiskUncontrolledInternalAuditResultInsertInput> = {}
): RiskUncontrolledInternalAuditResultInsertInput => {
  return {
    ...defaultRiskInternalAuditResult,
    parents: {
      data: [
        {
          ParentType: ParentTypeEnum.InternalAuditReport,
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
