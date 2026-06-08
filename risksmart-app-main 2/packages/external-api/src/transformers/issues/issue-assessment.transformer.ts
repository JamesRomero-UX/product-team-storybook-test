import type { IssueAssessmentResponse as ClientIssueAssessmentResponse } from '../../clients/client.interface';
import { resourceSchemas } from '../../schemas/index';
import type { IssueAssessmentResponse } from '../../schemas/schema.types';
import type { DataEntityTransformFn } from '../../types/transform';
import { idToResourceReference } from '../../utils/transforms';

type IssueAssessmentInput =
  NonNullable<ClientIssueAssessmentResponse>['issueAssessment'];

export type TransformIssueAssessmentItemFn = DataEntityTransformFn<
  IssueAssessmentInput,
  IssueAssessmentResponse
>;

export const transformIssueAssessmentItem: TransformIssueAssessmentItemFn = (
  issueAssessment,
  opts
) => {
  const { basePath } = opts;

  const [createdBy, updatedBy, certifiedIndividual, policyOwner] = [
    issueAssessment.CreatedByUser,
    issueAssessment.ModifiedByUser,
    issueAssessment.CertifiedIndividual,
    issueAssessment.PolicyOwner,
  ].map((id) =>
    id ? idToResourceReference(id, 'user', `${basePath}/users`) : null
  );

  const parents = [
    idToResourceReference(
      issueAssessment.ParentIssueId,
      'issue',
      `${basePath}/issues`
    ),
  ];

  return resourceSchemas.IssueAssessmentResponseSchema.parse({
    id: issueAssessment.Id,
    parentIssueId: issueAssessment.ParentIssueId,
    issueType: issueAssessment.IssueType,
    severity: issueAssessment.Severity,
    targetCloseDate: issueAssessment.TargetCloseDate,
    actualCloseDate: issueAssessment.ActualCloseDate,
    status: issueAssessment.Status,
    certifiedIndividual: issueAssessment.CertifiedIndividual,
    regulatoryBreach: issueAssessment.RegulatoryBreach,
    regulationsBreached: issueAssessment.RegulationsBreached,
    reportable: issueAssessment.Reportable,
    rationale: issueAssessment.Rationale,
    issueCausedByThirdParty: issueAssessment.IssueCausedByThirdParty,
    thirdPartyResponsible: issueAssessment.ThirdPartyResponsible,
    issueCausedBySystemIssue: issueAssessment.IssueCausedBySystemIssue,
    systemResponsible: issueAssessment.SystemResponsible,
    policyBreach: issueAssessment.PolicyBreach,
    policiesBreached: issueAssessment.PoliciesBreached,
    policyOwner: issueAssessment.PolicyOwner,
    policyOwnerCommentary: issueAssessment.PolicyOwnerCommentary,
    createdAt: issueAssessment.CreatedAtTimestamp,
    updatedAt: issueAssessment.ModifiedAtTimestamp,
    createdBy: issueAssessment.CreatedByUser,
    updatedBy: issueAssessment.ModifiedByUser || issueAssessment.CreatedByUser,
    links: {
      self: {
        href: `${basePath}/issues/${issueAssessment.ParentIssueId}/assessment`,
      },
      createdBy,
      updatedBy,
      certifiedIndividual,
      policyOwner,
      parents,
    },
  });
};
