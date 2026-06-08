import { useQuery as useApolloQuery } from '@apollo/client';
import { useQuery } from '@tanstack/react-query';
import type { TRPCClientErrorLike } from '@trpc/client';
import { useCallback, useMemo } from 'react';
import { useTRPC } from 'src/utils/trpc';
import { mapTRPCRefetch } from 'src/utils/trpcUtils';

import { useErrorNotification } from '@/hooks/useErrorNotification';
import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

import type { QueryHookConfig, QueryHookFactoryResult } from './types';
/**
 * Factory function that creates a GraphQL-to-TRPC wrapper hook.
 *
 * This reduces boilerplate by generating hooks that:
 * - Switch between GraphQL and TRPC based on the 'trpc' feature flag
 * - Handle error notifications automatically
 * - Map TRPC responses to GraphQL query structures
 * - Provide consistent return types
 */
export function createQueryHook<
  TQueryArgs,
  TTRPCOutput,
  TGraphQLData extends { __typename?: 'query_root' },
>(
  config: QueryHookConfig<TQueryArgs, TTRPCOutput, TGraphQLData>
): QueryHookFactoryResult<TQueryArgs, TGraphQLData> {
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

    // TRPC Query
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

    // GraphQL Query
    const graphqlVars = graphqlVariables && graphqlVariables(queryArgs);

    const {
      data: graphqlData,
      loading: graphqlLoading,
      refetch: graphqlRefetch,
      error: graphqlError,
    } = useApolloQuery(graphqlDocument, {
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

    // Memoized refetch functions to prevent unnecessary re-renders
    const graphqlRefetchMapped = useCallback(async () => {
      const { data: refetchData, error, loading } = await graphqlRefetch();
      const mappedData =
        refetchData && mapGraphQLData
          ? mapGraphQLData(refetchData, queryArgs)
          : refetchData;

      return { data: mappedData, error: error ?? null, loading };
    }, [graphqlRefetch, queryArgs]);

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
      refetch: graphqlRefetchMapped,
      error: graphqlError,
    };
  };
}
