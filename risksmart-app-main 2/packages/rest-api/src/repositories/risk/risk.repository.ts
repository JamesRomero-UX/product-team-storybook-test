import type { VariablesOf } from '@graphql-typed-document-node/core';

import type { RiskBoolExp, RiskOrderBy } from '../../../generated/graphql';
import {
  DeleteRisksDocument,
  GetRisksDocument,
  InsertRiskDocument,
  UpdateRiskDocument,
} from '../../../generated/graphql';
import { getHasuraBackendClient } from '../../backendGraphqlClient';
import type { FindOptions, Repository, RepositoryOptions } from '../types';

export type OrderBy = RiskOrderBy;
export type Where = RiskBoolExp;
export type CreateInput = VariablesOf<typeof InsertRiskDocument>['objects'];
export type UpdateInput = VariablesOf<typeof UpdateRiskDocument>;

export const RiskRepository = (opts: RepositoryOptions) => {
  const client = getHasuraBackendClient(
    opts.tenant,
    opts.orgKey,
    opts.userId,
    opts.userRole
  );

  return {
    async findWhere(where: Where, options?: FindOptions<OrderBy>) {
      const { data, errors } = await client.query({
        query: GetRisksDocument,
        variables: { where, ...options },
      });
      if (errors) {
        throw errors[0];
      }

      return data.risk;
    },

    async create(objects: CreateInput) {
      const { data, errors } = await client.mutate({
        mutation: InsertRiskDocument,
        variables: {
          objects,
        },
      });
      if (!data?.insert_risk || errors) {
        throw new Error(JSON.stringify(errors));
      }

      return data.insert_risk.returning;
    },

    async updateByPk(pk: string, set: UpdateInput) {
      const { data, errors } = await client.mutate({
        mutation: UpdateRiskDocument,
        variables: { ...set },
      });
      if (!data?.update_risk || errors) {
        throw new Error(JSON.stringify(errors));
      }

      return data.update_risk.affected_rows;
    },

    async delete(where: Where) {
      await client.mutate({
        mutation: DeleteRisksDocument,
        variables: { where },
      });
    },
  } satisfies Repository;
};
