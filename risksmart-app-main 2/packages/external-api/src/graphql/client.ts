import type { DocumentNode } from 'graphql';
import { print } from 'graphql';

import { logger } from '../utils/logger';

export interface GraphqlClientConfig {
  endpoint: string;
  defaultHeaders: Record<string, string>;
}

export interface GraphqlResponse<T> {
  data: T | null | undefined;
  errors?: readonly { message: string }[];
}

export interface GraphqlClient {
  mutate<TData, TVars>(
    document: DocumentNode,
    variables: TVars,
    headers?: Record<string, string>
  ): Promise<GraphqlResponse<TData>>;
}

export function createGraphqlClient(
  config: GraphqlClientConfig
): GraphqlClient {
  const { endpoint, defaultHeaders } = config;

  return {
    async mutate<TData, TVars>(
      document: DocumentNode,
      variables: TVars,
      headers?: Record<string, string>
    ): Promise<GraphqlResponse<TData>> {
      const query = print(document);
      const requestBody = JSON.stringify({
        query,
        variables,
      });
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...defaultHeaders,
          ...headers,
        },
        body: requestBody,
      });

      if (!response.ok) {
        logger.error(
          {
            status: response.status,
            gqlQuery: query,
            rawResponseBody: await response.text(),
          },
          'GraphQL client response failure'
        );
        throw new Error(
          `GraphQL request failed: ${response.status} ${response.statusText}`
        );
      }

      return response.json() as Promise<GraphqlResponse<TData>>;
    },
  };
}

export type { DocumentNode };
