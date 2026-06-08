import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import { getEnv } from './environment';

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
    headers['x-hasura-tenant-name'] = tenantName;
    console.log('x-tenant-name', tenantName);

    return { headers };
  });

  const httpLink = createHttpLink({
    uri: getUrl(),
  });

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: authLink.concat(httpLink),
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

export const getUrl = () => {
  const endpoint = getEnv('HASURA_TENANT_ENDPOINT');

  return `${endpoint}/v1/graphql`;
};
