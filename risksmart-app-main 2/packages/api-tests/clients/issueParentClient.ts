import type { VariablesOf } from '@graphql-typed-document-node/core';

import type { IssueParentInsertInput } from '../generated/graphql';
import {
  DeleteIssueParentsDocument,
  GetIssueParentsDocument,
  InsertIssueParentsDocument,
} from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const getIssueParents = async (options?: TestQueryOptions) =>
  (
    await getTestClient().query({
      context: getContext(options),
      query: GetIssueParentsDocument,
    })
  ).data.issue_parent;

export const insertIssueParents = async (
  variables: VariablesOf<typeof InsertIssueParentsDocument>,
  options?: TestQueryOptions
) => {
  return await getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertIssueParentsDocument,
  });
};

export const insertIssueParent = async (
  issueParent: IssueParentInsertInput,
  options?: TestQueryOptions
) => {
  return await insertIssueParents(
    {
      objects: [issueParent],
    },
    options
  );
};

export const deleteIssueParents = async (
  variables: VariablesOf<typeof DeleteIssueParentsDocument>,
  options?: TestQueryOptions
) => {
  return await getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: DeleteIssueParentsDocument,
  });
};
