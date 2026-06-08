import type { VariablesOf } from '@graphql-typed-document-node/core';

import type {
  ControlBoolExp,
  ControlOrderBy,
  UpdateControlDocument,
} from '../../../generated/graphql';
import {
  DeleteControlsDocument,
  GetControlsDocument,
} from '../../../generated/graphql';
import { getHasuraBackendClient } from '../../backendGraphqlClient';
import type { FindOptions, RepositoryOptions } from '../types';

export type Where = ControlBoolExp;
export type OrderBy = ControlOrderBy;
export type UpdateByPkInput = VariablesOf<typeof UpdateControlDocument>;

export const ControlRepository = (opts: RepositoryOptions) => {
  const client = getHasuraBackendClient(
    opts.tenant,
    opts.orgKey,
    opts.userId,
    opts.userRole
  );

  return {
    async findWhere(where: Where, options?: FindOptions<OrderBy>) {
      const { data, errors } = await client.query({
        query: GetControlsDocument,
        variables: { where, ...options },
      });
      if (errors) {
        throw errors[0];
      }

      return data.control;
    },

    async delete(id: string | string[]) {
      await client.mutate({
        mutation: DeleteControlsDocument,
        variables: { Ids: Array.isArray(id) ? id : [id] },
      });
    },
  };
};
