import type { DefaultContext, NormalizedCacheObject } from '@apollo/client';
import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
  InMemoryCache,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import fetch from 'cross-fetch';
import fs from 'fs';
import https from 'https';
import path from 'path';

import { getEnv } from '../../../stacks/environment';
import type { UserInsertInput } from '../generated/graphql';
import { getDefaultOrgId, getDefaultUserId } from './defaults';

const options = {
  // no-dd-sa
  cert: fs.readFileSync(
    path.resolve(
      __dirname,
      '../../../api-stack/nginx/certs/nginx-selfsigned.crt'
    ),
    `utf-8`
  ),
  // no-dd-sa
  key: fs.readFileSync(
    path.resolve(
      __dirname,
      '../../../api-stack/nginx/certs/nginx-selfsigned.key'
    ),
    'utf-8'
  ),
  rejectUnauthorized: false,
  keepAlive: false,
};

const sslConfiguredAgent = new https.Agent(options);

export enum HasuraRole {
  Admin = '',
  RiskManager = 'RiskManager',
  Standard = 'Standard',
}

export interface TestQueryOptions {
  user?: UserInsertInput;
  orgId?: string;
  confirmChangeRequest?: boolean;
}

export const warmRestAPICatchAll = async () => {
  await fetch('https://localhost/test', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      RestApiKey: getEnv('REST_API_KEY'),
    },
    // @ts-ignore
    agent: sslConfiguredAgent,
  });
};

export const enableEventsForOrg = async (orgKey: string) => {
  await fetch('https://localhost/enable-events', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ orgKey: orgKey }),
    // @ts-ignore
    agent: sslConfiguredAgent,
  });
};

export const disableEventsForOrg = async (orgKey: string) => {
  await fetch('https://localhost/disable-events', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ orgKey: orgKey }),
    // @ts-ignore
    agent: sslConfiguredAgent,
  });
};

let client: ApolloClient<NormalizedCacheObject>;

export const getContext = (options?: TestQueryOptions): DefaultContext => {
  return {
    headers: {
      'x-hasura-org-id': options?.user?.OrgKey ?? getDefaultOrgId(),
      'x-hasura-tenant-name': 'MultiTenant',
      'x-hasura-role': options?.user?.RoleKey ?? HasuraRole.Admin,
      'x-hasura-user-id': options?.user?.Id,
      'x-confirm-change-request': options?.confirmChangeRequest
        ? 'true'
        : 'false',
    },
  };
};

// Log any GraphQL errors or network error that occurred
//https://www.apollographql.com/docs/react/api/link/apollo-link-error
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach((error) => {
      console.error(JSON.stringify(error), operation.operationName);
    });
  }
  if (networkError) {
    console.error(JSON.stringify(networkError), operation.operationName);
  }
});

export const getTestClient = () => {
  if (!client) {
    const httpLink = createHttpLink({
      fetch,
      uri: 'http://localhost:8080/v1/graphql',
      headers: {
        'x-hasura-user-id': getDefaultUserId(),
        'x-hasura-org-id': getDefaultOrgId(),
        'x-hasura-admin-secret': 'myadminsecretkey',
        'x-hasura-role': 'RiskManager',
      },
    });

    client = new ApolloClient({
      cache: new InMemoryCache(),
      link: ApolloLink.from([errorLink, httpLink]),
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
  }

  return client;
};
