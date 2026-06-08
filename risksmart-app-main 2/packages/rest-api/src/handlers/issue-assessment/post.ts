import type { ParentIssueType } from '@risksmart-app/domain/src/types/consts/parent-issue-type';
import crypto from 'crypto';
import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { Forbidden } from 'http-errors';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { insertIssueAssessment } from 'src/services/issue-assessment/issueAssessmentService';
import { getNode } from 'src/services/node/nodeService';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import { getRisksmartApiClient } from '../../repositories/getRisksmartApiClient';
import { PostSchema } from './schema';

const issueAssessmentTypeMapping = {
  [ParentTypeEnum.Issue]: ParentTypeEnum.IssueAssessment,
  [ParentTypeEnum.IssueBreachLog]: ParentTypeEnum.IssueAssessmentBreachLog,
  [ParentTypeEnum.IssueConsumerDuty]:
    ParentTypeEnum.IssueAssessmentConsumerDuty,
  [ParentTypeEnum.IssueCustomerTrust]:
    ParentTypeEnum.IssueAssessmentCustomerTrust,
  [ParentTypeEnum.IssueGdprBreachLog]:
    ParentTypeEnum.IssueAssessmentGdprBreachLog,
  [ParentTypeEnum.IssuePciBreachLog]:
    ParentTypeEnum.IssueAssessmentPciBreachLog,
  [ParentTypeEnum.IssueRiskEvent]: ParentTypeEnum.IssueAssessmentRiskEvent,
  [ParentTypeEnum.IssueSarLog]: ParentTypeEnum.IssueAssessmentSarLog,
};

export const handler = backendRouteHandler(PostSchema, async (body) => {
  const hasuraClient = await getHasuraBackendClientForAction(body);
  const sessionData = getSessionData(body.session_variables);
  const input = body.input;
  const parent = await getNode(hasuraClient, input.ParentIssueId);
  const allowedParentTypes: ParentTypeEnum[] = [ParentTypeEnum.Issue];
  if (!parent) {
    throw new Forbidden('Access to parent denied');
  }
  if (!allowedParentTypes.includes(parent.ObjectType)) {
    throw new Forbidden('Invalid parent type');
  }

  const permissionGranted = await hasPermission(hasuraClient, {
    userId: sessionData.userId,
    parentObject: parent,
    objectType: ParentTypeEnum.IssueAssessment,
    accessType: AccessTypeEnum.Insert,
  });
  if (!permissionGranted) {
    throw new Forbidden('Access denied');
  }

  const { issue } = await getRisksmartApiClient(
    hasuraClient
  ).getIssueByIdForUser({
    Id: parent.Id,
  });
  if (!issue || issue.length !== 1) {
    throw new Forbidden('Parent issue not found');
  }

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
  const Id = crypto.randomUUID();
  const id = await insertIssueAssessment(hasuraClient, {
    Id,
    CustomAttributeData: input.CustomAttributeData,
    Tags: input.TagTypeIds.map((o) => ({
      TagTypeId: o,
      ParentId: input.ParentIssueId,
    })),
    Departments: input.DepartmentTypeIds.map((o) => ({
      DepartmentTypeId: o,
      ParentId: Id,
    })),
    ParentIssueId: input.ParentIssueId,
    ParentIds: parents.map((c) => c.Id),
    parents: parents.map((p) => ({
      IssueId: input.ParentIssueId,
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
    TagTypeIds: input.TagTypeIds,
    Type: issueAssessmentTypeMapping[issue[0]!.Type as ParentIssueType],
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      Id: id,
    }),
  };
});
