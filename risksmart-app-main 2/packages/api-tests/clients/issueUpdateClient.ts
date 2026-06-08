import type { IssueUpdateInsertInput } from '../generated/graphql';
import {
  DeleteIssueUpdateDocument,
  GetAllIssueUpdatesDocument,
  InsertIssueUpdateDocument,
  UpdateIssueUpdateDocument,
} from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

const client = getTestClient();

export const getIssueUpdates = async (options?: TestQueryOptions) => {
  const { data, error } = await client.query({
    context: getContext(options),
    query: GetAllIssueUpdatesDocument,
  });
  if (error) {
    console.error(error);
  }

  return data.issue_update;
};

export const insertIssueUpdate = async (
  objects: IssueUpdateInsertInput[],
  options?: TestQueryOptions
) =>
  await client.mutate({
    variables: {
      objects,
    },
    context: getContext(options),
    mutation: InsertIssueUpdateDocument,
  });

export const deleteIssueUpdate = async (
  id: string,
  options?: TestQueryOptions
) => {
  const result = await getTestClient().mutate({
    context: getContext(options),
    variables: {
      Id: id,
    },
    mutation: DeleteIssueUpdateDocument,
  });

  return result.data?.delete_issue_update;
};

export const updateIssueUpdate = async (
  id: string,
  title: string,
  options?: TestQueryOptions
) => {
  const result = await getTestClient().mutate({
    context: getContext(options),
    variables: {
      Id: id,
      Title: title,
    },
    mutation: UpdateIssueUpdateDocument,
  });

  return result.data?.update_issue_update;
};
