import { randomUUID } from 'crypto';
import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { Forbidden } from 'http-errors';
import { createScheduleRefresh } from 'src/adapters/create-schedule-refresh';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { getBackendRestApiClient } from 'src/repositories/getBackendRestApiClient';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import type { AttestationData } from './schema';
import { PostSchema } from './schema';

export const handler = backendRouteHandler(PostSchema, async (request) => {
  const sessionData = getSessionData(request.session_variables);
  const hasuraClient = getHasuraBackendClientForAction(request);
  const apiClient = getBackendRestApiClient(sessionData);
  const input = request.input.object;
  const permissionGranted = await hasPermission(hasuraClient, {
    userId: sessionData.userId,
    objectType: ParentTypeEnum.Document,
    accessType: AccessTypeEnum.Insert,
  });
  if (!permissionGranted) {
    throw new Forbidden('Access denied');
  }

  const id = randomUUID();
  const attestationData: AttestationData | undefined = input.attestation;

  const result = await apiClient.insertDocument({
    Id: id,
    DocumentType: input.DocumentType,

    Title: input.Title,
    Purpose: input.Purpose,
    ParentDocument: input.ParentDocument,
    linkedDocuments: input.LinkedDocumentIds.map((documentId) => ({
      LinkedDocumentId: documentId,
    })),
    CustomAttributeData: input.CustomAttributeData,

    Owners: input.OwnerUserIds.map((UserId) => ({ UserId })),
    Contributors: input.ContributorUserIds.map((UserId) => ({
      UserId,
    })),
    OwnerGroups: input.OwnerGroupIds.map((UserGroupId) => ({
      UserGroupId,
    })),
    ContributorGroups: input.ContributorGroupIds.map((UserGroupId) => ({
      UserGroupId,
    })),
    Tags: input.TagTypeIds.map((TagTypeId) => ({ TagTypeId })),
    Departments: input.DepartmentTypeIds.map((DepartmentTypeId) => ({
      DepartmentTypeId,
    })),
    schedule: {
      ...input.schedule,
      Id: id,
    },

    AttestationPromptText: attestationData?.AttestationPromptText ?? undefined,
    AttestationGroups: {
      data:
        attestationData?.AttestationGroupIds?.map((groupId) => ({
          GroupId: groupId,
        })) ?? [],
    },
    AttestationTimeLimit: attestationData?.AttestationTimeLimit ?? undefined,
    RequireGlobalAttestation:
      attestationData?.RequireGlobalAttestation ?? false,
  });
  const documentId = result.insert_document_one?.Id;
  if (!documentId) {
    throw new Error('Missing document id');
  }

  const { ctx, refreshDocumentScheduleState } =
    createScheduleRefresh(sessionData);
  await refreshDocumentScheduleState(ctx, documentId);

  return {
    statusCode: 200,
    body: JSON.stringify({
      Id: documentId,
    }),
  };
});
