import type { VariablesOf } from '@graphql-typed-document-node/core';

import type {
  AcceptanceBoolExp,
  AcceptanceOrderBy,
  AcceptanceParentInsertInput,
} from '../../../generated/graphql';
import {
  DeleteAcceptancesDocument,
  GetAcceptancesDocument,
  InsertAcceptanceParentDocument,
  InsertAcceptancesDocument,
  UpdateAcceptancesDocument,
} from '../../../generated/graphql';
import { getHasuraBackendClient } from '../../backendGraphqlClient';
import type { FindOptions, Repository, RepositoryOptions } from '../types';

export type Where = AcceptanceBoolExp;
export type OrderBy = AcceptanceOrderBy;
export type CreateInput = VariablesOf<
  typeof InsertAcceptancesDocument
>['objects'];
export type UpdateInput = VariablesOf<typeof UpdateAcceptancesDocument>['set'];

export const AcceptanceRepository = (opts: RepositoryOptions) => {
  const client = getHasuraBackendClient(
    opts.tenant,
    opts.orgKey,
    opts.userId,
    opts.userRole
  );

  return {
    async findWhere(where: Where, options?: FindOptions<OrderBy>) {
      const { data, errors } = await client.query({
        query: GetAcceptancesDocument,
        variables: { where, ...options },
      });
      if (errors) {
        throw errors[0];
      }

      return data.acceptance;
    },

    async create(objects: CreateInput) {
      const { data, errors } = await client.mutate({
        mutation: InsertAcceptancesDocument,
        variables: { objects: objects },
      });
      if (!data?.insert_acceptance || errors) {
        throw new Error(JSON.stringify(errors));
      }

      return data.insert_acceptance.returning;
    },

    async createParentLink(link: AcceptanceParentInsertInput) {
      const { data, errors } = await client.mutate({
        mutation: InsertAcceptanceParentDocument,
        variables: { objects: link },
      });
      if (!data?.insert_acceptance_parent || errors) {
        throw new Error(JSON.stringify(errors));
      }

      return data.insert_acceptance_parent.returning;
    },

    async update(where: Where, set: UpdateInput) {
      const { data, errors } = await client.mutate({
        mutation: UpdateAcceptancesDocument,
        variables: { where, set },
      });
      if (!data?.update_acceptance || errors) {
        throw new Error(JSON.stringify(errors));
      }

      return data.update_acceptance.returning;
    },

    async delete(id: string | string[]) {
      await client.mutate({
        mutation: DeleteAcceptancesDocument,
        variables: { Ids: Array.isArray(id) ? id : [id] },
      });
    },
  } satisfies Repository;
};
