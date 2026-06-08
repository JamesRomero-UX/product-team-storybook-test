import { GetAncestorContributorsDocument } from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const getAncestorContributors = async (options?: TestQueryOptions) => {
  const { data } = await getTestClient().query({
    context: getContext(options),
    query: GetAncestorContributorsDocument,
  });

  return data.ancestor_contributor;
};
