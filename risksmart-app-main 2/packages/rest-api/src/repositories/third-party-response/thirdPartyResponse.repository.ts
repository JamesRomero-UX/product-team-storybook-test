import type { VariablesOf } from '@graphql-typed-document-node/core';
import type {
  ThirdPartyResponseBoolExp,
  ThirdPartyResponseOrderBy,
} from 'generated/graphql';
import {
  GetThirdPartyResponsesDocument,
  GetThirdPartyResponsesWithParentsDocument,
  InsertThirdPartyResponsesDocument,
  UpdateThirdPartyResponseDocument,
} from 'generated/graphql';
import { getHasuraBackendClient } from 'src/backendGraphqlClient';

import type { FindOptions, RepositoryOptions } from '../types';

export type OrderBy = ThirdPartyResponseOrderBy;
export type Where = ThirdPartyResponseBoolExp;
export type CreateInput = VariablesOf<
  typeof InsertThirdPartyResponsesDocument
>['objects'];
export type SetInput = VariablesOf<
  typeof UpdateThirdPartyResponseDocument
>['_set'];

export const ThirdPartyResponseRepository = (opts: RepositoryOptions) => {
  const client = getHasuraBackendClient(
    opts.tenant,
    opts.orgKey,
    opts.userId,
    opts.userRole
  );

  return {
    async findWhere(where: Where, options?: FindOptions<OrderBy>) {
      const { data, errors } = await client.query({
        query: GetThirdPartyResponsesDocument,
        variables: { where, ...options },
      });
      if (errors) {
        throw errors[0];
      }

      return data.third_party_response;
    },

    async findWhereWithParents(where: Where, options?: FindOptions<OrderBy>) {
      const { data, errors } = await client.query({
        query: GetThirdPartyResponsesWithParentsDocument,
        variables: { where, ...options },
      });
      if (errors) {
        throw errors[0];
      }

      return data.third_party_response;
    },

    async create(objects: CreateInput) {
      const { data, errors } = await client.mutate({
        mutation: InsertThirdPartyResponsesDocument,
        variables: {
          objects,
        },
      });
      if (!data?.insert_third_party_response || errors) {
        throw new Error(JSON.stringify(errors));
      }

      return data.insert_third_party_response.returning;
    },

    async updateWhere(where: Where, _set: SetInput) {
      const { data: updateData, errors } = await client.mutate({
        mutation: UpdateThirdPartyResponseDocument,
        variables: {
          _set,
          where,
        },
      });
      if (!updateData?.update_third_party_response || errors) {
        throw new Error(JSON.stringify(errors));
      }

      return updateData.update_third_party_response.affected_rows;
    },
  };
};
