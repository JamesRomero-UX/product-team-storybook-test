import type { VariablesOf } from '@graphql-typed-document-node/core';

import type {
  ActionBoolExp,
  ActionOrderBy,
  ActionParentInsertInput,
  RelationFileInsertInput,
} from '../../../generated/graphql';
import {
  DeleteActionsDocument,
  GetActionsDocument,
  InsertActionParentsDocument,
  InsertActionsDocument,
  UpdateActionDocument,
  UpdateActionsDocument,
  UpdateActionWithFilesDocument,
} from '../../../generated/graphql';
import { getHasuraBackendClient } from '../../backendGraphqlClient';
import type { FindOptions, Repository, RepositoryOptions } from '../types';

export type Where = ActionBoolExp;
export type OrderBy = ActionOrderBy;
export type CreateInput = VariablesOf<typeof InsertActionsDocument>['objects'];
export type UpdateInput = VariablesOf<typeof UpdateActionsDocument>['set'];
export type UpdateByPkInput = VariablesOf<typeof UpdateActionDocument>;

export const ActionRepository = (opts: RepositoryOptions) => {
  const client = getHasuraBackendClient(
    opts.tenant,
    opts.orgKey,
    opts.userId,
    opts.userRole
  );

  return {
    async findWhere(where: Where, options?: FindOptions<OrderBy>) {
      const { data, errors } = await client.query({
        query: GetActionsDocument,
        variables: { where, ...options },
      });
      if (errors) {
        throw errors[0];
      }

      return data.action;
    },

    async create(objects: CreateInput) {
      const { data, errors } = await client.mutate({
        mutation: InsertActionsDocument,
        variables: { objects: objects },
      });
      if (!data?.insert_action || errors) {
        throw new Error(JSON.stringify(errors));
      }

      return data.insert_action.returning;
    },

    async createParentLink(link: ActionParentInsertInput) {
      const { data, errors } = await client.mutate({
        mutation: InsertActionParentsDocument,
        variables: { objects: link },
      });
      if (!data?.insert_action_parent || errors) {
        throw new Error(JSON.stringify(errors));
      }

      return data.insert_action_parent.returning;
    },

    async update(where: Where, set: UpdateInput) {
      const { data, errors } = await client.mutate({
        mutation: UpdateActionsDocument,
        variables: { where, set },
      });
      if (!data?.update_action || errors) {
        throw new Error(JSON.stringify(errors));
      }

      return data.update_action.returning;
    },

    async updateByPk(pk: string, set: UpdateByPkInput) {
      const { data, errors } = await client.mutate({
        mutation: UpdateActionDocument,
        variables: { ...set },
      });
      if (!data?.update_action || errors) {
        throw new Error(JSON.stringify(errors));
      }

      return data.update_action.affected_rows;
    },

    async delete(id: string | string[]) {
      await client.mutate({
        mutation: DeleteActionsDocument,
        variables: { Ids: Array.isArray(id) ? id : [id] },
      });
    },

    async updateWithFiles(
      set: UpdateByPkInput,
      addedFiles: RelationFileInsertInput[],
      deletedFileIds: string[]
    ) {
      const { data, errors } = await client.mutate({
        mutation: UpdateActionWithFilesDocument,
        variables: { ...set, addedFiles, deletedFileIds },
      });

      if (!data?.update_action || errors) {
        throw new Error(JSON.stringify(errors));
      }

      return data.update_action.affected_rows;
    },
  } satisfies Repository;
};
