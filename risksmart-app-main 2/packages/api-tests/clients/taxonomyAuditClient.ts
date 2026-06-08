import { GetTaxonomyAuditDocument } from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const getTaxonomyAudit = async (options?: TestQueryOptions) => {
  const { data } = await getTestClient().query({
    context: getContext(options),
    query: GetTaxonomyAuditDocument,
  });

  return data?.taxonomy_audit;
};
