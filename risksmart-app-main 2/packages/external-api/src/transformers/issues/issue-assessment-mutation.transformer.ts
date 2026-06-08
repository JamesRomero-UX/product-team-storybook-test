import type { UpdateIssueAssessmentRequest } from '../../schemas/issues/issue-assessment-mutate-request.schema';

export interface IssueAssessmentUpdateDefaults {
  IssueType: UpdateIssueAssessmentRequest['issueType'];
  Severity: number | null;
  TargetCloseDate: string | null;
  ActualCloseDate: string | null;
  CertifiedIndividual: string | null;
  RegulatoryBreach: boolean | null;
  RegulationsBreached: string | null;
  Reportable: boolean | null;
  Rationale: string | null;
  IssueCausedByThirdParty: boolean | null;
  ThirdPartyResponsible: string | null;
  IssueCausedBySystemIssue: boolean | null;
  SystemResponsible: string | null;
  PolicyBreach: boolean | null;
  PoliciesBreached: string | null;
  PolicyOwner: string | null;
  PolicyOwnerCommentary: string | null;
}

export function mergeIssueAssessmentUpdateDefaults(
  item: UpdateIssueAssessmentRequest,
  existing: IssueAssessmentUpdateDefaults
): UpdateIssueAssessmentRequest {
  return {
    ...item,
    ...(item.issueType === undefined && existing.IssueType !== undefined
      ? { issueType: existing.IssueType }
      : {}),
    ...(item.severity === undefined && existing.Severity !== undefined
      ? { severity: existing.Severity }
      : {}),
    ...(item.targetCloseDate === undefined &&
    existing.TargetCloseDate !== undefined
      ? { targetCloseDate: existing.TargetCloseDate }
      : {}),
    ...(item.actualCloseDate === undefined &&
    existing.ActualCloseDate !== undefined
      ? { actualCloseDate: existing.ActualCloseDate }
      : {}),
    ...(item.certifiedIndividual === undefined &&
    existing.CertifiedIndividual !== undefined
      ? { certifiedIndividual: existing.CertifiedIndividual }
      : {}),
    ...(item.regulatoryBreach === undefined &&
    existing.RegulatoryBreach !== undefined
      ? { regulatoryBreach: existing.RegulatoryBreach }
      : {}),
    ...(item.regulationsBreached === undefined &&
    existing.RegulationsBreached !== undefined
      ? { regulationsBreached: existing.RegulationsBreached }
      : {}),
    ...(item.reportable === undefined && existing.Reportable !== undefined
      ? { reportable: existing.Reportable }
      : {}),
    ...(item.rationale === undefined && existing.Rationale !== undefined
      ? { rationale: existing.Rationale }
      : {}),
    ...(item.issueCausedByThirdParty === undefined &&
    existing.IssueCausedByThirdParty !== undefined
      ? { issueCausedByThirdParty: existing.IssueCausedByThirdParty }
      : {}),
    ...(item.thirdPartyResponsible === undefined &&
    existing.ThirdPartyResponsible !== undefined
      ? { thirdPartyResponsible: existing.ThirdPartyResponsible }
      : {}),
    ...(item.issueCausedBySystemIssue === undefined &&
    existing.IssueCausedBySystemIssue !== undefined
      ? { issueCausedBySystemIssue: existing.IssueCausedBySystemIssue }
      : {}),
    ...(item.systemResponsible === undefined &&
    existing.SystemResponsible !== undefined
      ? { systemResponsible: existing.SystemResponsible }
      : {}),
    ...(item.policyBreach === undefined && existing.PolicyBreach !== undefined
      ? { policyBreach: existing.PolicyBreach }
      : {}),
    ...(item.policiesBreached === undefined &&
    existing.PoliciesBreached !== undefined
      ? { policiesBreached: existing.PoliciesBreached }
      : {}),
    ...(item.policyOwner === undefined && existing.PolicyOwner !== undefined
      ? { policyOwner: existing.PolicyOwner }
      : {}),
    ...(item.policyOwnerCommentary === undefined &&
    existing.PolicyOwnerCommentary !== undefined
      ? { policyOwnerCommentary: existing.PolicyOwnerCommentary }
      : {}),
  };
}
