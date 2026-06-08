import type {
  InsertChildIssueAssessmentMutationVariables,
  UpdateChildIssueAssessmentMutationVariables,
} from '../generated/graphql';
import { IssueAssessmentStatusEnum } from '../generated/graphql';

const defaultInsertChildIssueAssessment: InsertChildIssueAssessmentMutationVariables =
  {
    ActualCloseDate: undefined,
    CertifiedIndividual: undefined,
    IssueCausedBySystemIssue: undefined,
    IssueCausedByThirdParty: undefined,
    IssueType: undefined,
    ParentIssueId: '',
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
    RegulationsBreached: undefined,
    DepartmentTypeIds: [],
    TagTypeIds: [],
    RegulationsBreachedIds: [],
    AssociatedControlIds: [],
    PoliciesBreachedIds: [],
  };

export const buildInsertChildIssueAssessment = (
  overrides: Partial<InsertChildIssueAssessmentMutationVariables> = {}
): InsertChildIssueAssessmentMutationVariables => {
  return {
    ...defaultInsertChildIssueAssessment,
    ...overrides,
  };
};

const defaultUpdateChildIssueAssessment: UpdateChildIssueAssessmentMutationVariables =
  {
    Id: '',
    ActualCloseDate: undefined,
    CertifiedIndividual: undefined,
    IssueCausedBySystemIssue: undefined,
    IssueCausedByThirdParty: undefined,
    IssueType: undefined,
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
    RegulationsBreached: undefined,
    DepartmentTypeIds: [],
    TagTypeIds: [],
    RegulationsBreachedIds: [],
    AssociatedControlIds: [],
    PoliciesBreachedIds: [],
    OriginalTimestamp: '',
  };

export const buildUpdateChildIssueAssessment = (
  overrides: Partial<UpdateChildIssueAssessmentMutationVariables> = {}
): UpdateChildIssueAssessmentMutationVariables => {
  return {
    ...defaultUpdateChildIssueAssessment,
    ...overrides,
  };
};
