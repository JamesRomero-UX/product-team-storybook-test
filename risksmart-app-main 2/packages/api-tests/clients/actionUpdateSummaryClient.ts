import { GetAllActionUpdateSummariesDocument } from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const getActionUpdateSummaries = async (options?: TestQueryOptions) => {
  const { data } = await getTestClient().query({
    context: getContext(options),
    query: GetAllActionUpdateSummariesDocument,
  });

  return data.action_update_summary;
};
