import { IssueAssessmentStatus } from '@risksmart-app/domain/src/types/consts';
import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';

export const buildIssueAssessment = ({
  orgkey,
  userId,
  parentIssueId,
  overrides,
}: {
  orgkey: string;
  userId: string;
  parentIssueId: string;
  overrides?: Partial<InferInsertModel<'issue_assessment'>>;
}): InferInsertModel<'issue_assessment'> => ({
  ParentIssueId: parentIssueId,
  IssueType: 'Test Issue Type',
  Severity: 3,
  TargetCloseDate: '2024-02-15T10:00:00Z',
  ActualCloseDate: null,
  Status: IssueAssessmentStatus.Open,
  CertifiedIndividual: null,
  RegulatoryBreach: false,
  RegulationsBreached: null,
  Reportable: false,
  Rationale: 'Test rationale',
  IssueCausedByThirdParty: false,
  ThirdPartyResponsible: null,
  IssueCausedBySystemIssue: false,
  SystemResponsible: null,
  PolicyBreach: false,
  PoliciesBreached: null,
  PolicyOwner: null,
  PolicyOwnerCommentary: null,
  ModifiedByUser: userId,
  ModifiedAtTimestamp: '2024-01-15T10:00:00Z',
  OrgKey: orgkey,
  Meta: {},
  CreatedByUser: userId,
  CreatedAtTimestamp: '2024-01-15T10:00:00Z',
  ...overrides,
});
