import { sanitizeHtmlContent } from '@risksmart-app/shared/src/htmlSanitizer';
import { BadRequest } from 'http-errors';
import { getLogger } from 'src/logger';

import type { DocumentFileInsertInput } from '../../../generated/graphql';
import {
  DocumentFileTypeEnum,
  OrderBy,
  VersionStatusEnum,
} from '../../../generated/graphql';
import type { UpdateInput } from '../../repositories/document-version/document-version.repository';
import { DocumentVersionRepository } from '../../repositories/document-version/document-version.repository';
import { FileRepository } from '../../repositories/file/file.repository';
import type { ServiceOptions } from '../types';

const logger = getLogger();

export const DocumentVersionService = (opts: ServiceOptions) => {
  const documentVersionRepo = DocumentVersionRepository(opts);
  const fileRepo = FileRepository(opts);

  return {
    async findById(id: string) {
      logger.info('Requested document version', { versionId: id });
      const documentVersions = await documentVersionRepo.findWhere(
        {
          Id: { _eq: id },
        },
        { limit: 1 }
      );

      if (!documentVersions[0]) {
        throw new BadRequest('Document version not found');
      }

      return documentVersions[0];
    },

    async findLatestPublishedByParentDocumentId(parentDocumentId: string) {
      const documentVersions = await documentVersionRepo.findWhere(
        {
          ParentDocumentId: { _eq: parentDocumentId },
          Status: { _eq: VersionStatusEnum.Published },
        },
        { limit: 1, orderBy: [{ CreatedAtTimestamp: OrderBy.Desc }] }
      );

      if (!documentVersions[0]) {
        return null;
      }

      return documentVersions[0];
    },

    async create(data: DocumentFileInsertInput) {
      const result = await documentVersionRepo.create([
        {
          ...data,
          Content: data.Content ? sanitizeHtmlContent(data.Content) : undefined,
          Status: VersionStatusEnum.Draft,
        },
      ]);

      if (!result[0]) {
        throw new Error('Document version not created');
      }

      return result[0];
    },

    async update(id: string, userId: string, data: UpdateInput) {
      const current = (
        await documentVersionRepo.findWhere({ Id: { _eq: id } }, { limit: 1 })
      )[0];

      if (!current) {
        throw new BadRequest('Document version not found');
      }
      const updated = await documentVersionRepo.update(
        {
          Id: { _eq: id },
        },
        {
          ...data,
          Content: data.Content ? sanitizeHtmlContent(data.Content) : undefined,
        }
      );

      if (!updated[0]) {
        throw new Error('Document version not found');
      }
      const documentVersion = updated[0];

      if (current.FileId) {
        if (
          documentVersion.Type !== DocumentFileTypeEnum.File ||
          current.FileId !== documentVersion.FileId
        ) {
          await fileRepo.delete({ Id: { _eq: current.FileId } });
        }
      }

      if (documentVersion.Status === VersionStatusEnum.Published) {
        await documentVersionRepo.update(
          {
            ParentDocumentId: { _eq: documentVersion.ParentDocumentId },
            Status: { _eq: VersionStatusEnum.Published },
            Id: { _neq: documentVersion.Id },
          },
          {
            Status: VersionStatusEnum.Archived,
          }
        );
      }

      return documentVersion;
    },
  };
};
