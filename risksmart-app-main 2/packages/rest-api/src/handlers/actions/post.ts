import crypto from 'crypto';
import type {
  GetNodeQuery,
  InsertActionMutationVariables,
} from 'generated/graphql';
import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { Forbidden } from 'http-errors';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import type { ActionInput } from 'src/hasuraActionHelpers';
import {
  insertAction,
  insertChildAction,
} from 'src/services/action/actionService';
import { getNode } from 'src/services/node/nodeService';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';
import type z from 'zod';

import { PostSchema } from './schema';

export const lambdaHandler = async (
  body: ActionInput<z.infer<typeof PostSchema>>
) => {
  const hasuraClient = await getHasuraBackendClientForAction(body);
  const input = body.input;
  let parentObject: GetNodeQuery['node_by_pk'];
  const sessionData = getSessionData(body.session_variables);
  if (input.ParentId) {
    parentObject = await getNode(hasuraClient, input.ParentId);
    const allowedParentTypes: ParentTypeEnum[] = [
      ParentTypeEnum.Risk,
      ParentTypeEnum.Obligation,
      ParentTypeEnum.ObligationChange,
      ParentTypeEnum.Issue,
      ParentTypeEnum.IssueRiskEvent,
      ParentTypeEnum.IssueBreachLog,
      ParentTypeEnum.IssueConsumerDuty,
      ParentTypeEnum.IssueCustomerTrust,
      ParentTypeEnum.IssueGdprBreachLog,
      ParentTypeEnum.IssuePciBreachLog,
      ParentTypeEnum.IssueSarLog,
      ParentTypeEnum.Document,
      ParentTypeEnum.Control,
      ParentTypeEnum.Assessment,
      ParentTypeEnum.ComplianceMonitoringAssessment,
      ParentTypeEnum.InternalAuditReport,
      ParentTypeEnum.InternalAuditEntity,
      ParentTypeEnum.ThirdParty,
    ];
    if (!parentObject) {
      throw new Forbidden('Access to parent denied');
    }
    if (!allowedParentTypes.includes(parentObject.ObjectType)) {
      throw new Forbidden('Invalid parent type');
    }
    const permissionGranted = await hasPermission(hasuraClient, {
      userId: sessionData.userId,
      parentObject,
      objectType: ParentTypeEnum.Action,
      accessType: AccessTypeEnum.Insert,
    });
    if (!permissionGranted) {
      throw new Forbidden('Access denied');
    }
  }

  const Id = crypto.randomUUID();

  const insertActionVariables: InsertActionMutationVariables = {
    DateDue: input.DateDue,
    Title: input.Title,
    Status: input.Status,
    Priority: input.Priority,
    Id,
    Description: input.Description,
    CustomAttributeData: input.CustomAttributeData,
    ClosedDate: input.ClosedDate,
    DateRaised: input.DateRaised,
    Owners: input.OwnerUserIds.map((UserId) => ({ UserId, ParentId: Id })),
    OwnerGroups: input.OwnerGroupIds.map((UserGroupId) => ({
      UserGroupId,
      ParentId: Id,
    })),
    ContributorGroups: input.ContributorGroupIds.map((UserGroupId) => ({
      UserGroupId,
      ParentId: Id,
    })),
    Contributors: input.ContributorUserIds.map((UserId) => ({
      UserId,
      ParentId: Id,
    })),
    Tags: input.TagTypeIds.map((TagTypeId) => ({ TagTypeId, ParentId: Id })),
    Departments: input.DepartmentTypeIds.map((DepartmentTypeId) => ({
      DepartmentTypeId,
      ParentId: Id,
    })),
  };
  let id: string | undefined;
  if (parentObject) {
    id = await insertChildAction(hasuraClient, {
      ...insertActionVariables,
      ParentId: parentObject.Id,
      ParentType: parentObject.ObjectType,
    });
  } else {
    id = await insertAction(hasuraClient, insertActionVariables);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      Id: id,
    }),
  };
};

export const handler = backendRouteHandler(PostSchema, lambdaHandler);
