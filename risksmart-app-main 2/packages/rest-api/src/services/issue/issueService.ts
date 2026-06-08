import type { ApolloClient } from '@apollo/client';
import type { VariablesOf } from '@graphql-typed-document-node/core';
import {
  DeleteIssueParentDocument,
  InsertIssueParentDocument,
} from 'generated/graphql';

import { getLogger } from '../../logger';
const logger = getLogger();

export const insertIssueParent = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof InsertIssueParentDocument>
) => {
  logger.info('Inserting issue parent');
  const result = await hasuraClient.mutate({
    mutation: InsertIssueParentDocument,
    variables,
  });

  return result.data?.insert_issue_parent_one;
};

export const deleteIssueParent = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof DeleteIssueParentDocument>
) => {
  logger.info('Deleting issue parent');
  const result = await hasuraClient.mutate({
    mutation: DeleteIssueParentDocument,
    variables,
  });

  return result.data?.delete_issue_parent;
};
