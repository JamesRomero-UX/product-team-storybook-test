import type { ApolloClient } from '@apollo/client';
import type { VariablesOf } from '@graphql-typed-document-node/core';
import {
  InsertDashboardDocument,
  UpdateDashboardDocument,
} from 'generated/graphql';

import { getLogger } from '../../logger';
const logger = getLogger();

export const insertDashboard = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof InsertDashboardDocument>
) => {
  logger.info('Inserting dashboard');
  const result = await hasuraClient.mutate({
    mutation: InsertDashboardDocument,
    variables,
  });

  return result.data?.insert_dashboard_one?.Id;
};

export const updateDashboard = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof UpdateDashboardDocument>
) => {
  logger.info('Updating dashboard');
  const result = await hasuraClient.mutate({
    mutation: UpdateDashboardDocument,
    variables,
  });

  return result.data?.update_dashboard?.affected_rows;
};
