import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { IssueAssessmentInsertInput } from '../generated/graphql';
import { IssueAssessmentStatusEnum } from '../generated/graphql';

const defaultIssueAssessment: IssueAssessmentInsertInput = {
  ActualCloseDate: undefined,
  CertifiedIndividual: undefined,
  IssueCausedBySystemIssue: undefined,
  IssueCausedByThirdParty: undefined,
  IssueType: undefined,
  Meta: undefined,
  ParentIssueId: undefined,
  PoliciesBreached: undefined,
  PolicyBreach: undefined,
  PolicyOwner: undefined,
  PolicyOwnerCommentary: undefined,
  Rationale: undefined,
  RegulatoryBreach: undefined,
  Reportable: undefined,
  Severity: undefined,
  Status: IssueAssessmentStatusEnum.Open,
  SystemResponsible: undefined,
  TargetCloseDate: undefined,
  ThirdPartyResponsible: undefined,
  CreatedAtTimestamp: undefined,
  RegulationsBreached: undefined,
  ModifiedAtTimestamp: undefined,
};

export const buildIssueAssessment = (
  overrides: Partial<IssueAssessmentInsertInput> = {}
): IssueAssessmentInsertInput => {
  return {
    ...defaultIssueAssessment,
    Id: randomUUID(),
    ModifiedByUser: getDefaultUserId(),
    OrgKey: getDefaultOrgId(),
    CreatedByUser: getDefaultUserId(),
    ...overrides,
  };
};
