import type { VariablesOf } from '@graphql-typed-document-node/core';

import type { FileBoolExp, FileOrderBy } from '../../../generated/graphql';
import {
  DeleteFilesDocument,
  GetFilesDocument,
  InsertFileDocument,
  UpdateFilesDocument,
} from '../../../generated/graphql';
import { getHasuraBackendClient } from '../../backendGraphqlClient';
import type { FindOptions, Repository, RepositoryOptions } from '../types';

export type Where = FileBoolExp;
export type OrderBy = FileOrderBy;
export type CreateInput = VariablesOf<typeof InsertFileDocument>['objects'];
export type UpdateInput = VariablesOf<typeof UpdateFilesDocument>['set'];

export const FileRepository = (opts: RepositoryOptions) => {
  const client = getHasuraBackendClient(
    opts.tenant,
    opts.orgKey,
    opts.userId,
    opts.userRole
  );

  return {
    async findWhere(where: Where, options?: FindOptions<OrderBy>) {
      const { data, errors } = await client.query({
        query: GetFilesDocument,
        variables: { where, ...options },
      });
      if (errors) {
        throw errors[0];
      }

      return data.file;
    },

    async create(objects: CreateInput) {
      const { data, errors } = await client.mutate({
        mutation: InsertFileDocument,
        variables: { objects: objects },
      });
      if (!data?.insert_file || errors) {
        throw new Error(JSON.stringify(errors));
      }

      return data.insert_file.returning;
    },

    async update(where: Where, set: UpdateInput) {
      const { data, errors } = await client.mutate({
        mutation: UpdateFilesDocument,
        variables: { where, set },
      });
      if (!data?.update_file || errors) {
        throw new Error(JSON.stringify(errors));
      }

      return data.update_file.returning;
    },

    async delete(where: Where) {
      await client.mutate({
        mutation: DeleteFilesDocument,
        variables: { where },
      });
    },
  } satisfies Repository;
};
