import type {
  MutationOptions,
  OperationVariables,
  QueryOptions,
} from '@apollo/client';
import type { DocumentNode } from 'graphql';

import type { Requester } from '../generated/graphql2';
import { getSdk } from '../generated/graphql2';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export type ApolloRequesterOptions<
  V extends OperationVariables | undefined,
  R,
> =
  | Omit<QueryOptions<V>, 'variables' | 'query'>
  | Omit<MutationOptions<R, V>, 'variables' | 'mutation'>;

const validDocDefOps = ['mutation', 'query', 'subscription'];

function createRisksmartApiClient() {
  const requester = async <R, V extends OperationVariables>(
    doc: DocumentNode,
    variables: V,
    testQueryOptions?: TestQueryOptions
  ): Promise<R> => {
    const client = getTestClient();
    const context: ApolloRequesterOptions<V, R> = getContext(testQueryOptions);
    // Valid document should contain *single* query or mutation unless it's has a fragment
    if (
      doc.definitions.filter(
        (d) =>
          d.kind === 'OperationDefinition' &&
          validDocDefOps.includes(d.operation)
      ).length !== 1
    ) {
      throw new Error(
        'DocumentNode passed to Apollo Client must contain single query or mutation'
      );
    }

    const definition = doc.definitions[0];

    // Valid document should contain *OperationDefinition*
    if (definition.kind !== 'OperationDefinition') {
      throw new Error(
        'DocumentNode passed to Apollo Client must contain single query or mutation'
      );
    }

    switch (definition.operation) {
      case 'mutation': {
        const response = await client.mutate<R, V>({
          mutation: doc,
          variables,
          context,
        });

        if (response.errors) {
          throw response.errors[0];
        }

        if (response.data === undefined || response.data === null) {
          throw new Error('No data presented in the GraphQL response');
        }

        return response.data;
      }
      case 'query': {
        const response = await client.query<R, V>({
          query: doc,
          variables,
          context,
        });

        if (response.errors) {
          throw response.errors[0];
        }

        if (response.data === undefined || response.data === null) {
          throw new Error('No data presented in the GraphQL response');
        }

        return response.data;
      }
      case 'subscription': {
        throw new Error(
          'Subscription requests through SDK interface are not supported'
        );
      }
      default:
        throw new Error(`Unsupported operation ${definition.operation}`);
    }
  };

  // The local requester narrows V to OperationVariables and returns only Promise<R> (not AsyncIterable),
  // which are structural differences from the generated Requester type that TypeScript can't reconcile automatically.
  return getSdk(requester as Requester);
}

export type Sdk = ReturnType<typeof createRisksmartApiClient>;

export const apiClient = createRisksmartApiClient();
