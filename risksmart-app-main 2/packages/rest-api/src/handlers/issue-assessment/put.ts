import { hasLengthAtLeast } from '@risksmart-app/shared/typeGuards';
import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { Forbidden } from 'http-errors';
import { NotFound } from 'http-errors';
import { workflows } from 'src/approval-workflows/workflows';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { CUSTOMER_SUPPORT_ROLE } from 'src/repositories/types';
import { ChangeRequestService } from 'src/services/change-request/change-request.service';
import { IssueAssessmentService } from 'src/services/issue-assessment/issue-assessment.service';
import { getIssueAssessment } from 'src/services/issue-assessment/issueAssessmentService';
import { getNode } from 'src/services/node/nodeService';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import { PutSchema } from './schema';

export const handler = backendRouteHandler(PutSchema, async (body) => {
  const sessionData = getSessionData(body.session_variables);
  const hasuraClient = await getHasuraBackendClientForAction(body);
  const input = body.input;
  const node = await getNode(hasuraClient, input.Id);

  const allowedParentTypes: ParentTypeEnum[] = [
    ParentTypeEnum.IssueAssessment,
    ParentTypeEnum.IssueAssessmentBreachLog,
    ParentTypeEnum.IssueAssessmentConsumerDuty,
    ParentTypeEnum.IssueAssessmentCustomerTrust,
    ParentTypeEnum.IssueAssessmentGdprBreachLog,
    ParentTypeEnum.IssueAssessmentPciBreachLog,
    ParentTypeEnum.IssueAssessmentRiskEvent,
    ParentTypeEnum.IssueAssessmentSarLog,
  ];

  if (
    !node ||
    !node.ObjectType ||
    !allowedParentTypes.includes(node.ObjectType)
  ) {
    throw new Forbidden('Access to parent denied');
  }

  const permissionGranted = await hasPermission(hasuraClient, {
    userId: sessionData.userId,
    parentObject: node,
    objectType: ParentTypeEnum.IssueAssessment,
    accessType: AccessTypeEnum.Update,
  });
  if (!permissionGranted) {
    throw new Forbidden('Access denied');
  }
  const issueAssessment = await getIssueAssessment(hasuraClient, {
    Id: input.Id,
  });
  if (!issueAssessment) {
    throw new NotFound();
  }

  const parentIssueId = issueAssessment.ParentIssueId;

  const parents = [
    ...input.RegulationsBreachedIds.map((c) => ({
      Id: c,
      Type: ParentTypeEnum.Obligation,
    })),
    ...input.AssociatedControlIds.map((c) => ({
      Id: c,
      Type: ParentTypeEnum.Control,
    })),
    ...input.PoliciesBreachedIds.map((c) => ({
      Id: c,
      Type: ParentTypeEnum.Document,
    })),
  ];

  const payload = {
    Id: input.Id,
    CustomAttributeData: input.CustomAttributeData,
    tags: input.TagTypeIds.map((o) => ({
      TagTypeId: o,
      ParentId: parentIssueId,
    })),
    OriginalTimestamp: input.OriginalTimestamp,
    TagTypeIds: input.TagTypeIds,
    DepartmentTypeIds: input.DepartmentTypeIds,
    departments: input.DepartmentTypeIds.map((o) => ({
      DepartmentTypeId: o,
      ParentId: input.Id,
    })),
    ParentIssueId: parentIssueId,
    ParentIds: parents.map((c) => c.Id),
    parents: parents.map((p) => ({
      IssueId: parentIssueId,
      ParentId: p.Id,
      ParentType: p.Type,
    })),
    Severity: input.Severity,
    CertifiedIndividual: input.CertifiedIndividual,
    IssueType: input.IssueType,
    ActualCloseDate: input.ActualCloseDate,
    TargetCloseDate: input.TargetCloseDate,
    Status: input.Status,
    PolicyOwnerCommentary: input.PolicyOwnerCommentary,
    PolicyOwner: input.PolicyOwner,
    PolicyBreach: input.PolicyBreach,
    Reportable: input.Reportable,
    PoliciesBreached: input.PoliciesBreached,
    Rationale: input.Rationale,
    IssueCausedByThirdParty: input.IssueCausedByThirdParty,
    SystemResponsible: input.SystemResponsible,
    RegulatoryBreach: input.RegulatoryBreach,
    RegulationsBreached: input.RegulationsBreached,
    ThirdPartyResponsible: input.ThirdPartyResponsible,
    IssueCausedBySystemIssue: input.IssueCausedBySystemIssue,
  };

  const closeResults = await workflows['close-issue-assessment'](
    sessionData.tenant
  ).executeBulkDryRun(body)([
    {
      id: input.Id,
      orgKey: sessionData.orgKey,
      userId: sessionData.userId,
      data: payload,
    },
  ]);

  const targetCloseResults = await workflows[
    'update-issue-assessment-target-close-date'
  ](sessionData.tenant).executeBulkDryRun(body)([
    {
      id: input.Id,
      orgKey: sessionData.orgKey,
      userId: sessionData.userId,
      data: payload,
    },
  ]);

  const changeRequestService = ChangeRequestService({
    tenant: sessionData.tenant,
    orgKey: sessionData.orgKey,
    userId: sessionData.userId,
    userRole: CUSTOMER_SUPPORT_ROLE,
  });

  if (
    hasLengthAtLeast(closeResults, 1) &&
    closeResults[0].result === 'change-request-required'
  ) {
    await changeRequestService.create(
      closeResults[0].data.data,
      closeResults[0].data.type
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        Id: input.Id,
      }),
    };
  }

  if (
    hasLengthAtLeast(targetCloseResults, 1) &&
    targetCloseResults[0].result === 'change-request-required'
  ) {
    await changeRequestService.create(
      targetCloseResults[0].data.data,
      targetCloseResults[0].data.type
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        Id: input.Id,
      }),
    };
  }

  const service = IssueAssessmentService({
    tenant: sessionData.tenant,
    orgKey: sessionData.orgKey,
    userId: sessionData.userId,
    userRole: CUSTOMER_SUPPORT_ROLE,
  });

  await service.update(input.Id, sessionData.userId, payload);

  return {
    statusCode: 200,
    body: JSON.stringify({
      Id: input.Id,
    }),
  };
});
