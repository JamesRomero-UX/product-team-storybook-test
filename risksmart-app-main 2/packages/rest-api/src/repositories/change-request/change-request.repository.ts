import type { VariablesOf } from '@graphql-typed-document-node/core';

import type {
  ChangeRequestBoolExp,
  ChangeRequestOrderBy,
} from '../../../generated/graphql';
import {
  DeleteChangeRequestsDocument,
  GetChangeRequestsDocument,
  InsertChangeRequestsDocument,
  UpdateChangeRequestsDocument,
} from '../../../generated/graphql';
import { getHasuraBackendClient } from '../../backendGraphqlClient';
import type { FindOptions, Repository, RepositoryOptions } from '../types';

export type OrderBy = ChangeRequestOrderBy;
export type Where = ChangeRequestBoolExp;
export type CreateInput = VariablesOf<
  typeof InsertChangeRequestsDocument
>['objects'];
export type UpdateInput = VariablesOf<
  typeof UpdateChangeRequestsDocument
>['set'];

export const ChangeRequestRepository = (opts: RepositoryOptions) => {
  const client = getHasuraBackendClient(
    opts.tenant,
    opts.orgKey,
    opts.userId,
    opts.userRole
  );

  return {
    async findWhere(where: Where, options?: FindOptions<OrderBy>) {
      const { data, errors } = await client.query({
        query: GetChangeRequestsDocument,
        variables: { where, ...options },
      });
      if (errors) {
        throw errors[0];
      }

      return data.change_request;
    },

    async create(objects: CreateInput) {
      const { data, errors } = await client.mutate({
        mutation: InsertChangeRequestsDocument,
        variables: {
          objects,
        },
      });
      if (!data?.insert_change_request || errors) {
        throw new Error(JSON.stringify(errors));
      }

      return data.insert_change_request.returning;
    },

    async update(where: Where, set: UpdateInput) {
      const { data, errors } = await client.mutate({
        mutation: UpdateChangeRequestsDocument,
        variables: { where, set },
      });
      if (!data?.update_change_request || errors) {
        throw new Error(JSON.stringify(errors));
      }

      return data.update_change_request.returning;
    },

    async delete(where: Where) {
      await client.mutate({
        mutation: DeleteChangeRequestsDocument,
        variables: { where },
      });
    },
  } satisfies Repository;
};
