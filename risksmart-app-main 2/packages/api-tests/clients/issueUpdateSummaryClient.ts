import { GetAllIssueUpdateSummariesDocument } from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const getIssueUpdateSummaries = async (options?: TestQueryOptions) => {
  const { data } = await getTestClient().query({
    context: getContext(options),
    query: GetAllIssueUpdateSummariesDocument,
  });

  return data.issue_update_summary;
};
