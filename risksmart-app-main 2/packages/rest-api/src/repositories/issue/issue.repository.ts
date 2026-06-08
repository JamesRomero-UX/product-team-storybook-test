import type { IssueBoolExp, IssueOrderBy } from '../../../generated/graphql';
import {
  DeleteIssuesDocument,
  GetIssuesDocument,
} from '../../../generated/graphql';
import { getHasuraBackendClient } from '../../backendGraphqlClient';
import type { FindOptions, Repository, RepositoryOptions } from '../types';

export type Where = IssueBoolExp;
export type OrderBy = IssueOrderBy;

export const IssueRepository = (opts: RepositoryOptions) => {
  const client = getHasuraBackendClient(
    opts.tenant,
    opts.orgKey,
    opts.userId,
    opts.userRole
  );

  return {
    async findWhere(where: Where, options?: FindOptions<OrderBy>) {
      const { data, errors } = await client.query({
        query: GetIssuesDocument,
        variables: { where, ...options },
      });
      if (errors) {
        throw errors[0];
      }

      return data.issue;
    },

    async delete(id: string | string[]) {
      await client.mutate({
        mutation: DeleteIssuesDocument,
        variables: { Ids: Array.isArray(id) ? id : [id] },
      });
    },
  } satisfies Repository;
};
