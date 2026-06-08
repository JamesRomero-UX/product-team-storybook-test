import { allowedFileExtensions } from '@risksmart-app/shared/allowedFileExtensions';
import {
  ChangeRequestFileOperationEnum,
  InsertRelationFilesDocument,
  InsertRelationFilesOnlyDocument,
  ParentTypeEnum,
} from 'generated/graphql';
import { BadRequest, Unauthorized } from 'http-errors';
import frontendApiHandler from 'src/frontendApiHandler';
import { getTenantNameFromClaims } from 'src/requestHelpers';

import { getHasuraClient } from '../../../graphqlClient';
import { postSchema } from './schema';

export const handler = frontendApiHandler(
  postSchema,
  async ({ parentIds, parentType, files }, evt) => {
    if (!Object.values(ParentTypeEnum).includes(parentType as ParentTypeEnum)) {
      throw new BadRequest(`ParentType ${parentType} is not supported`);
    }

    if (
      files.find(
        (f) =>
          !allowedFileExtensions.find((extension) =>
            f.fileName.toLowerCase().endsWith(extension)
          )
      )
    ) {
      throw new BadRequest('Unsupported file extension');
    }

    if (!evt.headers.authorization) {
      throw new Unauthorized('Invalid authorization credentials in request');
    }

    const hasuraClient = await getHasuraClient({
      authorization: evt.headers.authorization,
      tenantName: getTenantNameFromClaims(evt),
    });

    const fileIds = files.map((x) => x.fileId);

    const newFiles = files.filter(
      (file) =>
        file.changeRequestFileOperation !==
        ChangeRequestFileOperationEnum.Removed
    );

    const changeRequestRemovedFiles = files.filter(
      (file) =>
        file.changeRequestFileOperation ===
        ChangeRequestFileOperationEnum.Removed
    );

    if (newFiles.length > 0) {
      await hasuraClient.mutate({
        mutation: InsertRelationFilesDocument,
        variables: {
          files: newFiles.map((f) => ({
            ContentType: f.mimeType,
            FileName: f.fileName,
            FileSize: f.fileSize,
            Id: f.fileId,
            Meta: f.meta,
          })),
          relationFiles: newFiles.flatMap((f) =>
            parentIds.map((p) => ({
              ParentId: p,
              ParentType: parentType as ParentTypeEnum,
              FileId: f.fileId,
              ChangeRequestFileOperation: f.changeRequestFileOperation ?? null,
            }))
          ),
        },
      });
    }

    if (changeRequestRemovedFiles.length > 0) {
      await hasuraClient.mutate({
        mutation: InsertRelationFilesOnlyDocument,
        variables: {
          relationFiles: changeRequestRemovedFiles.flatMap((f) =>
            parentIds.map((p) => ({
              ParentId: p,
              ParentType: parentType as ParentTypeEnum,
              FileId: f.fileId,
              ChangeRequestFileOperation: f.changeRequestFileOperation,
            }))
          ),
        },
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        fileIds,
      }),
    };
  }
);
