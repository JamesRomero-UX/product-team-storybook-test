import type { CreateIssueAssessmentRequest } from '@risksmart-app/events/src/types/request-types';

import { executeAsyncRequest } from '../../clients/async-request';
import { toApiContext } from '../../clients/client-utils';
import { dataLayerApiClient } from '../../clients/data-layer-api-client';
import type { IssueAssessmentService, ServiceContext } from '../service.types';

export class IssueAssessmentServiceImpl implements IssueAssessmentService {
  async insertIssueAssessment(
    ctx: ServiceContext,
    input: CreateIssueAssessmentRequest
  ): Promise<{ Id: string }> {
    return executeAsyncRequest(ctx, input, {
      requestType: 'CREATE_ISSUE_ASSESSMENT',
      buildRequestBody: (input) => ({
        ParentIssueId: input.ParentIssueId,
        Severity: input.Severity ?? null,
        Status: input.Status ?? null,
        CertifiedIndividual: input.CertifiedIndividual ?? null,
        IssueType: input.IssueType ?? null,
        ActualCloseDate: input.ActualCloseDate ?? null,
        TargetCloseDate: input.TargetCloseDate ?? null,
        PolicyOwnerCommentary: input.PolicyOwnerCommentary ?? null,
        PolicyOwner: input.PolicyOwner ?? null,
        PolicyBreach: input.PolicyBreach ?? null,
        Reportable: input.Reportable ?? null,
        PoliciesBreached: input.PoliciesBreached ?? null,
        Rationale: input.Rationale ?? null,
        IssueCausedByThirdParty: input.IssueCausedByThirdParty ?? null,
        SystemResponsible: input.SystemResponsible ?? null,
        RegulatoryBreach: input.RegulatoryBreach ?? null,
        RegulationsBreached: input.RegulationsBreached ?? null,
        ThirdPartyResponsible: input.ThirdPartyResponsible ?? null,
        IssueCausedBySystemIssue: input.IssueCausedBySystemIssue ?? null,
        CustomAttributeData: input.CustomAttributeData ?? null,
        TagTypeIds: input.TagTypeIds ?? [],
        DepartmentTypeIds: input.DepartmentTypeIds ?? [],
        RegulationsBreachedIds: input.RegulationsBreachedIds ?? [],
        AssociatedControlIds: input.AssociatedControlIds ?? [],
        PoliciesBreachedIds: input.PoliciesBreachedIds ?? [],
      }),
      apiCall: (ctx, input, correlationId) =>
        dataLayerApiClient.createIssueAssessment(
          toApiContext(ctx),
          input,
          correlationId
        ),
      errorMessages: {
        403: 'You do not have permission to create issue assessments',
        404: 'Parent issue not found',
      },
    });
  }
}
