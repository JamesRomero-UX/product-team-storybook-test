import type { VariablesOf } from '@graphql-typed-document-node/core';
import type {
  InsertRelationFilesOnlyDocument,
  RelationFileBoolExp,
} from 'generated/graphql';
import { GetRelationFileDocument } from 'generated/graphql';
import { getHasuraBackendClient } from 'src/backendGraphqlClient';

import type { Repository, RepositoryOptions } from '../types';

export type Where = RelationFileBoolExp;
export type CreateInput = VariablesOf<
  typeof InsertRelationFilesOnlyDocument
>['relationFiles'];

export const RelationFileRepository = (opts: RepositoryOptions) => {
  const client = getHasuraBackendClient(
    opts.tenant,
    opts.orgKey,
    opts.userId,
    opts.userRole
  );

  return {
    async findWhere(where: Where) {
      const { data, errors } = await client.query({
        query: GetRelationFileDocument,
        variables: { where },
      });
      if (errors) {
        throw errors[0];
      }

      return data.relation_file;
    },
  } satisfies Repository;
};
