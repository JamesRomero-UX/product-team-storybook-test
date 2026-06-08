import type { ApolloError } from '@apollo/client';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { TRPCClientErrorLike } from '@trpc/client';
import type { useTRPC } from 'src/utils/trpc';

type TRPCError = TRPCClientErrorLike<{
  transformer: true;
  errorShape: unknown;
}>;

export type QueryHookError = TRPCError | ApolloError | null | undefined;

type QueryHookResult<TData> = {
  loading: boolean;
  data: TData | undefined;
  refetch: () => Promise<{ data: TData | undefined; error: QueryHookError }>;
  error: QueryHookError;
};

export type TRPCClient = ReturnType<typeof useTRPC>;

/**
 * The result shape from calling queryOptions on a TRPC procedure
 */
export type QueryOptionsResult = { queryKey: readonly unknown[] };

/**
 * Constrains TGraphQLData to only accept GraphQL query result types.
 * Rejects subscription_root and mutation_root types at compile time.
 */
type GraphQLQueryData = { __typename?: 'query_root' };

/**
 * Config for createQueryHook
 *
 * @template TQueryArgs - The hook's argument type (defined by consumer)
 * @template TTRPCOutput - The TRPC response type
 * @template TGraphQLData - The GraphQL query result type (must extend GraphQLQueryData)
 */
export type QueryHookConfig<
  TQueryArgs,
  TTRPCOutput,
  TGraphQLData extends GraphQLQueryData,
> = {
  /**
   * TRPC query options callback.
   * Example (no input): (trpc) => trpc.frontend.action.register.queryOptions()
   * Example (with input): (trpc, args) => trpc.frontend.action.actionById.queryOptions({ id: args.id })
   */
  trpcQueryOptions: (trpc: TRPCClient, args: TQueryArgs) => QueryOptionsResult;

  /**
   * Maps TRPC response to match GraphQL query structure.
   */
  mapTrpcDataToGraphQL: (data: TTRPCOutput) => TGraphQLData;

  /**
   * The GraphQL document to use when TRPC is disabled.
   * Must be a query document — subscriptions and mutations are not supported.
   */

  // graphql document arguments are typed through the graphql variables property of the config
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  graphqlDocument: TypedDocumentNode<TGraphQLData, any>;

  /**
   * GraphQL variables callback. Can use hooks (e.g., useEntityWhereFilter).
   * Receives queryArgs for conditional logic.
   */
  graphqlVariables?: (args: TQueryArgs) => Record<string, unknown>;

  /**
   * Fetch policy for GraphQL queries. Defaults to 'no-cache'.
   */
  graphqlFetchPolicy?: 'no-cache' | 'cache-first' | 'network-only';

  /**
   * Stale time for TRPC queries in milliseconds.
   */
  trpcStaleTime?: number;

  /**
   * Optional transform for GraphQL data after fetching.
   * Use this for client-side filtering/transformation that can't be done in the query.
   * Receives queryArgs to allow conditional transformations.
   */
  mapGraphQLData?: (data: TGraphQLData, args: TQueryArgs) => TGraphQLData;
};

export type QueryHookFactoryResult<
  TQueryArgs,
  TGraphQLData extends GraphQLQueryData,
> = (args: {
  queryArgs: TQueryArgs;
  shouldSkip?: boolean;
}) => QueryHookResult<TGraphQLData>;

/**
 * Constrains TGraphQLData to only accept GraphQL subscription result types.
 * Rejects query_root and mutation_root types at compile time.
 */
type GraphQLSubscriptionData = { __typename?: 'subscription_root' };

/**
 * Config for createSubscriptionHook
 *
 * @template TSubscriptionArgs - The hook's argument type (defined by consumer)
 * @template TTRPCOutput - The TRPC response type
 * @template TGraphQLData - The GraphQL subscription result type (must extend GraphQLSubscriptionData)
 */
export type SubscriptionHookConfig<
  TSubscriptionArgs,
  TTRPCOutput,
  TGraphQLData extends GraphQLSubscriptionData,
> = {
  /**
   * TRPC query options callback.
   * Example (no input): (trpc) => trpc.frontend.action.register.queryOptions()
   * Example (with input): (trpc, args) => trpc.frontend.action.actionById.queryOptions({ id: args.id })
   */
  trpcQueryOptions: (
    trpc: TRPCClient,
    args: TSubscriptionArgs
  ) => QueryOptionsResult;

  /**
   * Maps TRPC response to match GraphQL subscription structure.
   */
  mapTrpcDataToGraphQL: (data: TTRPCOutput) => TGraphQLData;

  /**
   * The GraphQL document to use when TRPC is disabled.
   * Must be a subscription document — queries and mutations are not supported.
   */
  // graphql document arguments are typed through the graphql codegen
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  graphqlDocument: TypedDocumentNode<TGraphQLData, any>;

  /**
   * GraphQL variables callback. Can use hooks (e.g., useEntityWhereFilter).
   * Receives subscriptionArgs for conditional logic.
   */
  graphqlVariables?: (args: TSubscriptionArgs) => Record<string, unknown>;

  /**
   * Fetch policy for GraphQL subscriptions. Defaults to 'no-cache'.
   */
  graphqlFetchPolicy?: 'no-cache' | 'cache-first' | 'network-only';

  /**
   * Stale time for TRPC queries in milliseconds.
   */
  trpcStaleTime?: number;

  /**
   * Optional transform for GraphQL data after fetching.
   * Use this for client-side filtering/transformation that can't be done in the subscription.
   * Receives subscriptionArgs to allow conditional transformations.
   */
  mapGraphQLData?: (
    data: TGraphQLData,
    args: TSubscriptionArgs
  ) => TGraphQLData;
};

export type SubscriptionHookFactoryResult<
  TSubscriptionArgs,
  TGraphQLData extends GraphQLSubscriptionData,
> = (args: {
  queryArgs: TSubscriptionArgs;
  shouldSkip?: boolean;
}) => QueryHookResult<TGraphQLData>;
