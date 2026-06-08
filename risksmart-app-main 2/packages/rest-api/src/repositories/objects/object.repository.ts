import { GetAllObjectIdsDocument } from '../../../generated/graphql';
import { getHasuraBackendClient } from '../../backendGraphqlClient';
import type { RepositoryOptions } from '../types';

export const ObjectRepository = (opts: RepositoryOptions) => {
  const client = getHasuraBackendClient(
    opts.tenant,
    opts.orgKey,
    opts.userId,
    opts.userRole
  );

  return {
    async getAllObjectIds() {
      const { data, errors } = await client.query({
        query: GetAllObjectIdsDocument,
        variables: {},
      });
      if (errors) {
        throw errors[0];
      }

      return data;
    },
  };
};
