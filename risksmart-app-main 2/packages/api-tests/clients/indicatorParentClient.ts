import { GetIndicatorParentsDocument } from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const getIndicatorParents = async (options?: TestQueryOptions) =>
  (
    await getTestClient().query({
      context: getContext(options),
      query: GetIndicatorParentsDocument,
    })
  ).data.indicator_parent;
