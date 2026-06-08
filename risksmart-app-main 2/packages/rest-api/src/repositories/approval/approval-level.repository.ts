import type { VariablesOf } from '@graphql-typed-document-node/core';

import type {
  ApprovalLevelBoolExp,
  ApprovalLevelOrderBy,
} from '../../../generated/graphql';
import {
  DeleteApprovalLevelsDocument,
  GetApprovalLevelsDocument,
  InsertApprovalLevelsDocument,
  UpdateApprovalLevelsDocument,
} from '../../../generated/graphql';
import { getHasuraBackendClient } from '../../backendGraphqlClient';
import type { FindOptions, Repository, RepositoryOptions } from '../types';

export type OrderBy = ApprovalLevelOrderBy;
export type Where = ApprovalLevelBoolExp;
export type CreateInput = VariablesOf<
  typeof InsertApprovalLevelsDocument
>['objects'];
export type UpdateInput = VariablesOf<
  typeof UpdateApprovalLevelsDocument
>['set'];

export const ApprovalLevelRepository = (opts: RepositoryOptions) => {
  const client = getHasuraBackendClient(
    opts.tenant,
    opts.orgKey,
    opts.userId,
    opts.userRole
  );

  return {
    async findWhere(where: Where, options?: FindOptions<OrderBy>) {
      const { data, errors } = await client.query({
        query: GetApprovalLevelsDocument,
        variables: { where, ...options },
      });
      if (errors) {
        throw errors[0];
      }

      return data.approval_level;
    },

    async create(objects: CreateInput) {
      const { data, errors } = await client.mutate({
        mutation: InsertApprovalLevelsDocument,
        variables: {
          objects,
        },
      });
      if (!data?.insert_approval_level || errors) {
        throw new Error(JSON.stringify(errors));
      }

      return data.insert_approval_level.returning;
    },

    async update(where: Where, set: UpdateInput) {
      const { data, errors } = await client.mutate({
        mutation: UpdateApprovalLevelsDocument,
        variables: { where, set },
      });
      if (!data?.update_approval_level || errors) {
        throw new Error(JSON.stringify(errors));
      }

      return data.update_approval_level.returning;
    },

    async delete(where: Where) {
      await client.mutate({
        mutation: DeleteApprovalLevelsDocument,
        variables: { where },
      });
    },
  } satisfies Repository;
};
