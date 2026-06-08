import type { WithCustomAttributeData } from '../../clients/mutation-client.interface';
import {
  type InsertIssueAssessmentMutationVariables,
  IssueAssessmentStatusEnum,
  type UpdateIssueAssessmentMutationVariables,
} from '../../generated/graphql';
import type {
  CreateIssueAssessmentRequest,
  UpdateIssueAssessmentRequest,
} from '../../schemas/issues/issue-assessment-mutate-request.schema';

const statusMap: Record<string, IssueAssessmentStatusEnum> = {
  open: IssueAssessmentStatusEnum.Open,
  closed: IssueAssessmentStatusEnum.Closed,
  declined: IssueAssessmentStatusEnum.Declined,
  pending: IssueAssessmentStatusEnum.Pending,
};

const mapStatus = (
  status: string | null | undefined
): IssueAssessmentStatusEnum | null => {
  if (status == null) {
    return null;
  }

  return statusMap[status] ?? null;
};

const toBaseAssessmentFields = (
  data: WithCustomAttributeData<CreateIssueAssessmentRequest>,
  existingDepartmentTypeIds?: string[]
): Omit<InsertIssueAssessmentMutationVariables, 'ParentIssueId'> => ({
  IssueType: data.issueType ?? null,
  Severity: data.severity ?? null,
  TargetCloseDate: data.targetCloseDate ?? null,
  ActualCloseDate: data.actualCloseDate ?? null,
  Status: mapStatus(data.status),
  CertifiedIndividual: data.certifiedIndividual ?? null,
  RegulatoryBreach: data.regulatoryBreach ?? null,
  RegulationsBreached: data.regulationsBreached ?? null,
  Reportable: data.reportable ?? null,
  Rationale: data.rationale ?? null,
  IssueCausedByThirdParty: data.issueCausedByThirdParty ?? null,
  ThirdPartyResponsible: data.thirdPartyResponsible ?? null,
  IssueCausedBySystemIssue: data.issueCausedBySystemIssue ?? null,
  SystemResponsible: data.systemResponsible ?? null,
  PolicyBreach: data.policyBreach ?? null,
  PoliciesBreached: data.policiesBreached ?? null,
  PolicyOwner: data.policyOwner ?? null,
  PolicyOwnerCommentary: data.policyOwnerCommentary ?? null,
  TagTypeIds: [],
  DepartmentTypeIds: existingDepartmentTypeIds ?? [],
  RegulationsBreachedIds: [],
  AssociatedControlIds: [],
  PoliciesBreachedIds: [],
  CustomAttributeData: data.customAttributeData ?? null,
});

export const toGraphqlCreateIssueAssessmentInput = (
  data: WithCustomAttributeData<CreateIssueAssessmentRequest>,
  parentIssueId: string
): InsertIssueAssessmentMutationVariables => ({
  ParentIssueId: parentIssueId,
  ...toBaseAssessmentFields(data),
});

export const toGraphqlUpdateIssueAssessmentInput = (
  data: WithCustomAttributeData<UpdateIssueAssessmentRequest>,
  assessmentId: string,
  originalTimestamp: string,
  existingDepartmentTypeIds?: string[]
): UpdateIssueAssessmentMutationVariables => ({
  Id: assessmentId,
  OriginalTimestamp: originalTimestamp,
  ...toBaseAssessmentFields(data, existingDepartmentTypeIds),
});
