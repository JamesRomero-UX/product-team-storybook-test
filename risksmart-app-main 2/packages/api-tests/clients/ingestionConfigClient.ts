import { GetIngestionConfigsDocument } from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const getIngestionConfigs = async (options?: TestQueryOptions) =>
  await getTestClient().query({
    context: getContext(options),
    query: GetIngestionConfigsDocument,
  });
