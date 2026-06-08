import {
  GetAllInternalAuditIdsDocument,
  GetAllInternalAuditsDocument,
} from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const getInternalAuditIds = async (options?: TestQueryOptions) =>
  await getTestClient().query({
    context: getContext(options),
    query: GetAllInternalAuditIdsDocument,
  });

export const getInternalAudits = async (options?: TestQueryOptions) =>
  await getTestClient().query({
    context: getContext(options),
    query: GetAllInternalAuditsDocument,
  });
