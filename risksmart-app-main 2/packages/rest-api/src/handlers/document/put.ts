import { hasLengthAtLeast } from '@risksmart-app/shared/typeGuards';
import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { Forbidden } from 'http-errors';
import { NotFound } from 'http-errors';
import { createScheduleRefresh } from 'src/adapters/create-schedule-refresh';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { ModifiedSinceLastViewError } from 'src/errors/ModifiedSinceLastViewError';
import { getBackendRestApiClient } from 'src/repositories/getBackendRestApiClient';
import { getNode } from 'src/services/node/nodeService';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import type { AttestationData } from './schema';
import { PutSchema } from './schema';

export const handler = backendRouteHandler(PutSchema, async (request) => {
  const sessionData = getSessionData(request.session_variables);
  const hasuraClient = getHasuraBackendClientForAction(request);
  const apiClient = getBackendRestApiClient(sessionData);
  const input = request.input.object;
  const parentObject = await getNode(hasuraClient, input.Id);
  const permissionGranted = await hasPermission(hasuraClient, {
    userId: sessionData.userId,
    objectType: ParentTypeEnum.Document,
    accessType: AccessTypeEnum.Update,
    parentObject,
  });
  if (!permissionGranted) {
    throw new Forbidden('Access denied');
  }
  const Id = input.Id;

  const { document: documents } = await apiClient.getDocumentById({ Id });

  if (!hasLengthAtLeast(documents, 1)) {
    throw new NotFound();
  }

  if (
    new Date(documents[0].ModifiedAtTimestamp).valueOf() !==
    new Date(input.OriginalTimestamp).valueOf()
  ) {
    throw new ModifiedSinceLastViewError();
  }

  const attestationData: AttestationData | undefined = input.attestation;

  const result = await apiClient.updateDocument({
    Id,
    DocumentType: input.DocumentType,
    OriginalTimestamp: input.OriginalTimestamp,
    LinkedDocumentIds: input.LinkedDocumentIds,

    Title: input.Title,
    Purpose: input.Purpose,
    ParentDocument: input.ParentDocument,
    LinkedDocuments: input.LinkedDocumentIds.map((documentId) => ({
      LinkedDocumentId: documentId,
      DocumentId: Id,
    })),
    CustomAttributeData: input.CustomAttributeData,

    Owners: input.OwnerUserIds.map((UserId) => ({ UserId, ParentId: Id })),
    OwnerIds: input.OwnerUserIds,
    Contributors: input.ContributorUserIds.map((UserId) => ({
      UserId,
      ParentId: Id,
    })),
    ContributorIds: input.ContributorUserIds,
    OwnerGroups: input.OwnerGroupIds.map((UserGroupId) => ({
      UserGroupId,
      ParentId: Id,
    })),
    OwnerGroupIds: input.OwnerGroupIds,
    ContributorGroups: input.ContributorGroupIds.map((UserGroupId) => ({
      UserGroupId,
      ParentId: Id,
    })),
    ContributorGroupIds: input.ContributorGroupIds,
    Tags: input.TagTypeIds.map((TagTypeId) => ({
      TagTypeId,
      ParentId: Id,
    })),
    TagTypeIds: input.TagTypeIds,
    Departments: input.DepartmentTypeIds.map((DepartmentTypeId) => ({
      DepartmentTypeId,
      ParentId: Id,
    })),
    DepartmentTypeIds: input.DepartmentTypeIds,
    schedule: {
      ...input.schedule,
      Id: input.Id,
    },

    AttestationPromptText: attestationData?.AttestationPromptText ?? undefined,
    AttestationGroupIds: attestationData?.AttestationGroupIds ?? [],
    AttestationTimeLimit: attestationData?.AttestationTimeLimit ?? undefined,
    RequireGlobalAttestation:
      attestationData?.RequireGlobalAttestation ?? false,
    AttestationGroups:
      attestationData?.AttestationGroupIds?.map((GroupId) => ({
        GroupId,
      })) ?? [],
  });
  const affected_rows = result.update_document?.affected_rows;
  if (affected_rows != 1) {
    throw new Error('Failed to update document');
  }

  const { ctx, refreshDocumentScheduleState } =
    createScheduleRefresh(sessionData);
  await refreshDocumentScheduleState(ctx, input.Id);

  return {
    statusCode: 200,
    body: JSON.stringify({
      Id: input.Id,
    }),
  };
});
