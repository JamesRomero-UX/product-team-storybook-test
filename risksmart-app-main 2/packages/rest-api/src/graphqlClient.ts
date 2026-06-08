import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
  InMemoryCache,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

import apolloMetricLink from './apolloMetricLink';
import { getEnv } from './environment';
import { getLogger } from './logger';
import { tenantNameSessionKey } from './requestHelpers';

type Options = { tenantName: string } & (
  | {
      authorization: string;
    }
  | { adminSecret: string }
  | {
      adminSecret: string;
      backendOnly: true;
      hasuraSessionVariables: { [key: string]: string };
    }
);

const logger = getLogger();

export const getHasuraClient = ({ tenantName, ...rest }: Options) => {
  const authLink = setContext(async (_, { headers }) => {
    headers = { ...headers };
    if ('adminSecret' in rest) {
      headers['x-hasura-admin-secret'] = rest.adminSecret;
      if ('backendOnly' in rest) {
        headers = {
          ...headers,
          'x-hasura-use-backend-only-permissions': 'true',
          ...rest.hasuraSessionVariables,
        };
      }
    } else {
      headers.authorization = rest.authorization;
    }
    headers['x-tenant-name'] = tenantName;
    headers[tenantNameSessionKey] = headers[tenantNameSessionKey] ?? tenantName;
    logger.appendKeys({ tenantName });

    return { headers };
  });

  const httpLink = createHttpLink({
    uri: getUrl(),
  });

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.from([apolloMetricLink, errorLink, authLink, httpLink]),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'ignore',
      },
      query: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
      },
    },
  });

  return client;
};

// Log any GraphQL errors or network error that occurred
//https://www.apollographql.com/docs/react/api/link/apollo-link-error
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach((error) => {
      logger.error(error.message, {
        error: JSON.stringify(error),
        operationName: operation.operationName,
      });
    });
  }
  if (networkError) {
    logger.error(networkError.message, {
      error: JSON.stringify(networkError),
      operationName: operation.operationName,
    });
  }
});

export const getUrl = () => {
  const endpoint = getEnv('HASURA_TENANT_ENDPOINT');

  return `${endpoint}/v1/graphql`;
};
