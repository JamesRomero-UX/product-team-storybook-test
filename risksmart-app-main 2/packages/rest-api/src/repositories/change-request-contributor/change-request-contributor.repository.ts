import type { VariablesOf } from '@graphql-typed-document-node/core';

import type {
  ChangeRequestContributorBoolExp,
  ChangeRequestContributorOrderBy,
} from '../../../generated/graphql';
import {
  DeleteChangeRequestContributorsDocument,
  GetChangeRequestContributorsDocument,
  InsertChangeRequestContributorsDocument,
  UpdateChangeRequestContributorsDocument,
} from '../../../generated/graphql';
import { getHasuraBackendClient } from '../../backendGraphqlClient';
import type { FindOptions, Repository, RepositoryOptions } from '../types';

export type OrderBy = ChangeRequestContributorOrderBy;
export type Where = ChangeRequestContributorBoolExp;
export type CreateInput = VariablesOf<
  typeof InsertChangeRequestContributorsDocument
>['objects'];
export type UpdateInput = VariablesOf<
  typeof UpdateChangeRequestContributorsDocument
>['set'];

export const ChangeRequestContributorRepository = (opts: RepositoryOptions) => {
  const client = getHasuraBackendClient(
    opts.tenant,
    opts.orgKey,
    opts.userId,
    opts.userRole
  );

  return {
    async findWhere(where: Where, options?: FindOptions<OrderBy>) {
      const { data, errors } = await client.query({
        query: GetChangeRequestContributorsDocument,
        variables: { where, ...options },
      });
      if (errors) {
        throw errors[0];
      }

      return data.change_request_contributor;
    },

    async create(objects: CreateInput) {
      const { data, errors } = await client.mutate({
        mutation: InsertChangeRequestContributorsDocument,
        variables: {
          objects,
        },
      });
      if (!data?.insert_change_request_contributor || errors) {
        throw new Error(JSON.stringify(errors));
      }

      return data.insert_change_request_contributor.returning;
    },

    async update(where: Where, set: UpdateInput) {
      const { data, errors } = await client.mutate({
        mutation: UpdateChangeRequestContributorsDocument,
        variables: { where, set },
      });
      if (!data?.update_change_request_contributor || errors) {
        throw new Error(JSON.stringify(errors));
      }

      return data.update_change_request_contributor.returning;
    },

    async delete(where: Where) {
      await client.mutate({
        mutation: DeleteChangeRequestContributorsDocument,
        variables: { where },
      });
    },
  } satisfies Repository;
};
