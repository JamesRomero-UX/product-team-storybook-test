import type { ApolloClient } from '@apollo/client';
import type { VariablesOf } from '@graphql-typed-document-node/core';
import {
  ChangeRequestFileOperationEnum,
  GetFileRelationCountDocument,
} from 'generated/graphql';
import { CUSTOMER_SUPPORT_ROLE } from 'src/repositories/types';

import { RelationFileService } from './relationFile.service';

export const getFileRelatedFileCount = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof GetFileRelationCountDocument>
) => {
  const result = await hasuraClient.mutate({
    mutation: GetFileRelationCountDocument,
    variables,
  });

  return result.data?.file;
};

export const getUpdatedFiles = async (
  tenant: string,
  orgKey: string,
  userId: string,
  changeRequestId?: string
) => {
  const relationFileService = RelationFileService({
    tenant,
    orgKey,
    userId,
    userRole: CUSTOMER_SUPPORT_ROLE,
  });

  const relationFiles = changeRequestId
    ? await relationFileService.findAllByParentId(changeRequestId)
    : null;

  const addedFiles =
    relationFiles?.filter(
      (relationFile) =>
        relationFile.ChangeRequestFileOperation ===
        ChangeRequestFileOperationEnum.Added
    ) ?? [];

  const deletedFiles =
    relationFiles?.filter(
      (relationFile) =>
        relationFile.ChangeRequestFileOperation ===
        ChangeRequestFileOperationEnum.Removed
    ) ?? [];

  return { addedFiles, deletedFiles };
};
