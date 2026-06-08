import { useSubscription } from '@apollo/client';
import { useQuery } from '@tanstack/react-query';
import type { TRPCClientErrorLike } from '@trpc/client';
import { useCallback, useMemo } from 'react';
import { useTRPC } from 'src/utils/trpc';
import { mapTRPCRefetch } from 'src/utils/trpcUtils';

import { useErrorNotification } from '@/hooks/useErrorNotification';
import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

import type {
  SubscriptionHookConfig,
  SubscriptionHookFactoryResult,
} from './types';
/**
 * Factory function that creates a GraphQL subscription-to-TRPC wrapper hook.
 *
 * This reduces boilerplate by generating hooks that:
 * - Switch between GraphQL subscriptions and TRPC based on the 'trpc' feature flag
 * - Handle error notifications automatically
 * - Map TRPC responses to GraphQL subscription structures
 * - Provide consistent return types
 */
export function createSubscriptionHook<
  TSubscriptionArgs,
  TTRPCOutput,
  TGraphQLData extends { __typename?: 'subscription_root' },
>(
  config: SubscriptionHookConfig<TSubscriptionArgs, TTRPCOutput, TGraphQLData>
): SubscriptionHookFactoryResult<TSubscriptionArgs, TGraphQLData> {
  const {
    trpcQueryOptions,
    mapTrpcDataToGraphQL,
    graphqlDocument,
    graphqlVariables,
    graphqlFetchPolicy = 'no-cache',
    trpcStaleTime,
    mapGraphQLData,
  } = config;

  return ({ queryArgs, shouldSkip }) => {
    const skip = shouldSkip ?? false;
    const trpcEnabled = useIsFeatureFlagEnabled('trpc');
    const trpc = useTRPC();

    // TRPC Query - TODO replace with Tanstack useSubscription after tRPC SSE implementation (RSP-4320)
    const {
      data: trpcData,
      isLoading: trpcLoading,
      refetch: trpcRefetch,
      error: trpcError,
    } = useQuery<
      TTRPCOutput,
      TRPCClientErrorLike<{ transformer: true; errorShape: unknown }>
    >({
      ...trpcQueryOptions(trpc, queryArgs),
      enabled: trpcEnabled && !skip,
      staleTime: trpcStaleTime,
    });

    useErrorNotification(trpcError, trpcEnabled);

    // Transform TRPC data to match GraphQL structure
    const mappedTrpcData = useMemo(
      () => (trpcData ? mapTrpcDataToGraphQL(trpcData) : undefined),
      [trpcData]
    );

    // Memoized refetch functions to prevent unnecessary re-renders
    const trpcRefetchMapped = useCallback(
      () => mapTRPCRefetch(trpcRefetch, mapTrpcDataToGraphQL),
      [trpcRefetch]
    );

    // GraphQL Subscription
    const graphqlVars = graphqlVariables && graphqlVariables(queryArgs);

    const {
      data: graphqlData,
      loading: graphqlLoading,
      error: graphqlError,
    } = useSubscription(graphqlDocument, {
      variables: graphqlVars,
      fetchPolicy: graphqlFetchPolicy,
      skip: trpcEnabled || skip,
    });

    useErrorNotification(graphqlError, !trpcEnabled);

    // Transform GraphQL data if mapper provided
    const mappedGraphqlData = useMemo(
      () =>
        graphqlData && mapGraphQLData
          ? mapGraphQLData(graphqlData, queryArgs)
          : graphqlData,
      [graphqlData, queryArgs]
    );

    // Subscriptions auto-update, so refetch is a no-op
    const graphqlRefetchNoop = useCallback(
      () => Promise.resolve({ data: undefined, error: null }),
      []
    );

    // Return appropriate data based on feature flag
    if (trpcEnabled) {
      return {
        loading: trpcLoading,
        data: mappedTrpcData,
        refetch: trpcRefetchMapped,
        error: trpcError,
      };
    }

    return {
      loading: graphqlLoading,
      data: mappedGraphqlData,
      refetch: graphqlRefetchNoop,
      error: graphqlError,
    };
  };
}
