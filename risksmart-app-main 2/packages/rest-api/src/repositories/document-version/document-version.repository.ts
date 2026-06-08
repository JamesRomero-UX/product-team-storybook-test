import type { VariablesOf } from '@graphql-typed-document-node/core';

import type {
  DocumentFileBoolExp,
  DocumentFileOrderBy,
} from '../../../generated/graphql';
import {
  DeleteDocumentFilesDocument,
  GetDocumentFilesDocument,
  InsertDocumentFileDocument,
  UpdateDocumentFilesDocument,
} from '../../../generated/graphql';
import { getHasuraBackendClient } from '../../backendGraphqlClient';
import type { FindOptions, Repository, RepositoryOptions } from '../types';

export type OrderBy = DocumentFileOrderBy;
export type Where = DocumentFileBoolExp;
export type CreateInput = VariablesOf<
  typeof InsertDocumentFileDocument
>['objects'];
export type UpdateInput = VariablesOf<
  typeof UpdateDocumentFilesDocument
>['set'];

export const DocumentVersionRepository = (opts: RepositoryOptions) => {
  const client = getHasuraBackendClient(
    opts.tenant,
    opts.orgKey,
    opts.userId,
    opts.userRole
  );

  return {
    async findWhere(where: Where, options?: FindOptions<OrderBy>) {
      const { data, errors } = await client.query({
        query: GetDocumentFilesDocument,
        variables: { where, ...options },
      });
      if (errors) {
        throw errors[0];
      }

      return data.document_file;
    },

    async create(objects: CreateInput) {
      const { data, errors } = await client.mutate({
        mutation: InsertDocumentFileDocument,
        variables: {
          objects,
        },
      });

      if (!data?.insert_document_file || errors) {
        throw new Error(JSON.stringify(errors));
      }

      return data.insert_document_file.returning;
    },

    async update(where: Where, set: UpdateInput) {
      const { data, errors } = await client.mutate({
        mutation: UpdateDocumentFilesDocument,
        variables: { where, set },
      });

      if (!data?.update_document_file || errors) {
        throw new Error(JSON.stringify(errors));
      }

      return data.update_document_file.returning;
    },

    async delete(where: Where) {
      await client.mutate({
        mutation: DeleteDocumentFilesDocument,
        variables: { where },
      });
    },
  } satisfies Repository;
};
