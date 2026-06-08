import type { NodeBoolExp, NodeOrderBy } from '../../../generated/graphql';
import { GetNodesDocument } from '../../../generated/graphql';
import { getHasuraBackendClient } from '../../backendGraphqlClient';
import type { FindOptions, Repository, RepositoryOptions } from '../types';

export type Where = NodeBoolExp;
export type OrderBy = NodeOrderBy;

export const NodeRepository = (opts: RepositoryOptions) => {
  const client = getHasuraBackendClient(
    opts.tenant,
    opts.orgKey,
    opts.userId,
    opts.userRole
  );

  return {
    async findWhere(where: Where, options?: FindOptions<OrderBy>) {
      const { data, errors } = await client.query({
        query: GetNodesDocument,
        variables: { where, ...options },
      });
      if (errors) {
        throw errors[0];
      }

      return data?.node;
    },
  } satisfies Repository;
};
