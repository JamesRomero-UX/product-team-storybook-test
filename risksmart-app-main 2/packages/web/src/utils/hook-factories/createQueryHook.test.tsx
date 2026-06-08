import type { ApolloError, DocumentNode } from '@apollo/client';
import { useQuery as useApolloQuery } from '@apollo/client';
import { useQuery } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { TRPCClientErrorLike } from '@trpc/client';
import { beforeEach, describe, expect, it, vi, vitest } from 'vitest';

import { useErrorNotification } from '@/hooks/useErrorNotification';
import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

import { createQueryHook } from './createQueryHook';
import type { TRPCClient } from './types';

vi.mock('@apollo/client', () => ({
  useQuery: vi.fn(),
}));
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));
vi.mock('src/utils/trpc', () => ({
  useTRPC: vi.fn(() => mockTrpcClient),
}));
vi.mock('src/utils', () => ({
  mapTRPCRefetch: vi.fn(
    async (
      refetch: () => Promise<{ data: unknown }>,
      mapper: (data: unknown) => unknown
    ) => {
      const result = await refetch();

      return {
        data: result.data ? mapper(result.data) : undefined,
        error: null,
      };
    }
  ),
}));
vi.mock('@/hooks/useErrorNotification');
vi.mock('@/hooks/useIsFeatureFlagEnabled');

const mockUseApolloQuery = vitest.mocked(useApolloQuery);
const mockUseTanstackQuery = vitest.mocked(useQuery);
const mockUseIsFeatureFlagEnabled = vitest.mocked(useIsFeatureFlagEnabled);
const mockUseErrorNotification = vitest.mocked(useErrorNotification);

const mockGraphqlDocument = {} as DocumentNode;

const mockTrpcClient = {
  frontend: {
    test: {
      queryOptions: vi.fn((input: unknown) => ({
        queryKey: ['test', input],
      })),
    },
  },
} as unknown as TRPCClient;

// Test types matching real usage patterns
type TestArgs = { id: string };
type TestTRPCOutput = { id: string; name: string }[];
type TestGraphQLData = {
  __typename?: 'query_root';
  items: { id: string; name: string }[];
};

const createTestConfig = (
  overrides?: Partial<
    Parameters<
      typeof createQueryHook<TestArgs, TestTRPCOutput, TestGraphQLData>
    >[0]
  >
) => ({
  trpcQueryOptions: (_trpc: TRPCClient, args: TestArgs) => ({
    queryKey: ['test', args.id] as const,
  }),
  mapTrpcDataToGraphQL: (data: TestTRPCOutput): TestGraphQLData => ({
    items: data,
  }),
  graphqlDocument: mockGraphqlDocument,
  graphqlVariables: (args: TestArgs) => ({ _eq: args.id }),
  trpcStaleTime: 30000,
  ...overrides,
});

describe('createQueryHook', () => {
  const mockTrpcRefetch = vi.fn();
  const mockGraphqlRefetch = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    mockUseTanstackQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      refetch: mockTrpcRefetch,
      error: null,
    } as unknown as ReturnType<typeof useQuery>);

    mockUseApolloQuery.mockReturnValue({
      data: undefined,
      loading: false,
      refetch: mockGraphqlRefetch,
      error: undefined,
    } as unknown as ReturnType<typeof useApolloQuery>);

    mockTrpcRefetch.mockResolvedValue({ data: undefined });
    mockGraphqlRefetch.mockResolvedValue({ data: undefined, error: null });
  });

  describe('when TRPC feature flag is enabled', () => {
    beforeEach(() => {
      mockUseIsFeatureFlagEnabled.mockReturnValue(true);
    });

    it('returns TRPC data mapped to GraphQL format', () => {
      const trpcData: TestTRPCOutput = [{ id: '1', name: 'Test' }];

      mockUseTanstackQuery.mockReturnValue({
        data: trpcData,
        isLoading: false,
        refetch: mockTrpcRefetch,
        error: null,
      } as unknown as ReturnType<typeof useQuery>);

      const useTestHook = createQueryHook<
        TestArgs,
        TestTRPCOutput,
        TestGraphQLData
      >(createTestConfig());

      const { result } = renderHook(() =>
        useTestHook({ queryArgs: { id: '1' } })
      );

      expect(result.current.data).toEqual({ items: trpcData });
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('returns loading state from TRPC', () => {
      mockUseTanstackQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        refetch: mockTrpcRefetch,
        error: null,
      } as unknown as ReturnType<typeof useQuery>);

      const useTestHook = createQueryHook<
        TestArgs,
        TestTRPCOutput,
        TestGraphQLData
      >(createTestConfig());

      const { result } = renderHook(() =>
        useTestHook({ queryArgs: { id: '1' } })
      );

      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it('returns TRPC error', () => {
      const trpcError = {
        message: 'TRPC Error',
      } as TRPCClientErrorLike<{ transformer: true; errorShape: unknown }>;

      mockUseTanstackQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        refetch: mockTrpcRefetch,
        error: trpcError,
      } as unknown as ReturnType<typeof useQuery>);

      const useTestHook = createQueryHook<
        TestArgs,
        TestTRPCOutput,
        TestGraphQLData
      >(createTestConfig());

      const { result } = renderHook(() =>
        useTestHook({ queryArgs: { id: '1' } })
      );

      expect(result.current.error).toBe(trpcError);
    });

    it('calls useErrorNotification with TRPC error', () => {
      const trpcError = {
        message: 'TRPC Error',
      } as TRPCClientErrorLike<{ transformer: true; errorShape: unknown }>;

      mockUseTanstackQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        refetch: mockTrpcRefetch,
        error: trpcError,
      } as unknown as ReturnType<typeof useQuery>);

      const useTestHook = createQueryHook<
        TestArgs,
        TestTRPCOutput,
        TestGraphQLData
      >(createTestConfig());

      renderHook(() => useTestHook({ queryArgs: { id: '1' } }));

      expect(mockUseErrorNotification).toHaveBeenCalledWith(trpcError, true);
    });

    it('enables TRPC query and skips GraphQL query', () => {
      const useTestHook = createQueryHook<
        TestArgs,
        TestTRPCOutput,
        TestGraphQLData
      >(createTestConfig());

      renderHook(() => useTestHook({ queryArgs: { id: '1' } }));

      expect(mockUseTanstackQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: true,
          staleTime: 30000,
        })
      );

      expect(mockUseApolloQuery).toHaveBeenCalledWith(
        mockGraphqlDocument,
        expect.objectContaining({
          skip: true,
        })
      );
    });

    it('passes query key from trpcQueryOptions to tanstack query', () => {
      const useTestHook = createQueryHook<
        TestArgs,
        TestTRPCOutput,
        TestGraphQLData
      >(createTestConfig());

      renderHook(() => useTestHook({ queryArgs: { id: 'test-123' } }));

      expect(mockUseTanstackQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['test', 'test-123'],
        })
      );
    });

    it('handles refetch and maps data correctly', async () => {
      const newData: TestTRPCOutput = [{ id: '2', name: 'New' }];

      mockTrpcRefetch.mockResolvedValue({ data: newData });

      const useTestHook = createQueryHook<
        TestArgs,
        TestTRPCOutput,
        TestGraphQLData
      >(createTestConfig());

      const { result } = renderHook(() =>
        useTestHook({ queryArgs: { id: '1' } })
      );

      const refetchResult = await result.current.refetch();

      await waitFor(() => {
        expect(refetchResult.data).toEqual({ items: newData });
        expect(refetchResult.error).toBeNull();
      });
    });

    it('returns undefined data when TRPC data is undefined', () => {
      mockUseTanstackQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        refetch: mockTrpcRefetch,
        error: null,
      } as unknown as ReturnType<typeof useQuery>);

      const useTestHook = createQueryHook<
        TestArgs,
        TestTRPCOutput,
        TestGraphQLData
      >(createTestConfig());

      const { result } = renderHook(() =>
        useTestHook({ queryArgs: { id: '1' } })
      );

      expect(result.current.data).toBeUndefined();
    });
  });

  describe('when TRPC feature flag is disabled', () => {
    beforeEach(() => {
      mockUseIsFeatureFlagEnabled.mockReturnValue(false);
    });

    it('returns GraphQL data directly', () => {
      const graphqlData: TestGraphQLData = {
        items: [{ id: '1', name: 'GraphQL' }],
      };

      mockUseApolloQuery.mockReturnValue({
        data: graphqlData,
        loading: false,
        refetch: mockGraphqlRefetch,
        error: undefined,
      } as unknown as ReturnType<typeof useApolloQuery>);

      const useTestHook = createQueryHook<
        TestArgs,
        TestTRPCOutput,
        TestGraphQLData
      >(createTestConfig());

      const { result } = renderHook(() =>
        useTestHook({ queryArgs: { id: '1' } })
      );

      expect(result.current.data).toEqual(graphqlData);
      expect(result.current.loading).toBe(false);
    });

    it('returns loading state from GraphQL', () => {
      mockUseApolloQuery.mockReturnValue({
        data: undefined,
        loading: true,
        refetch: mockGraphqlRefetch,
        error: undefined,
      } as unknown as ReturnType<typeof useApolloQuery>);

      const useTestHook = createQueryHook<
        TestArgs,
        TestTRPCOutput,
        TestGraphQLData
      >(createTestConfig());

      const { result } = renderHook(() =>
        useTestHook({ queryArgs: { id: '1' } })
      );

      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it('returns GraphQL error', () => {
      const graphqlError = { message: 'GraphQL Error' } as ApolloError;

      mockUseApolloQuery.mockReturnValue({
        data: undefined,
        loading: false,
        refetch: mockGraphqlRefetch,
        error: graphqlError,
      } as unknown as ReturnType<typeof useApolloQuery>);

      const useTestHook = createQueryHook<
        TestArgs,
        TestTRPCOutput,
        TestGraphQLData
      >(createTestConfig());

      const { result } = renderHook(() =>
        useTestHook({ queryArgs: { id: '1' } })
      );

      expect(result.current.error).toBe(graphqlError);
    });

    it('calls useErrorNotification with GraphQL error', () => {
      const graphqlError = { message: 'GraphQL Error' } as ApolloError;

      mockUseApolloQuery.mockReturnValue({
        data: undefined,
        loading: false,
        refetch: mockGraphqlRefetch,
        error: graphqlError,
      } as unknown as ReturnType<typeof useApolloQuery>);

      const useTestHook = createQueryHook<
        TestArgs,
        TestTRPCOutput,
        TestGraphQLData
      >(createTestConfig());

      renderHook(() => useTestHook({ queryArgs: { id: '1' } }));

      expect(mockUseErrorNotification).toHaveBeenCalledWith(graphqlError, true);
    });

    it('disables TRPC query and enables GraphQL query', () => {
      const useTestHook = createQueryHook<
        TestArgs,
        TestTRPCOutput,
        TestGraphQLData
      >(createTestConfig());

      renderHook(() => useTestHook({ queryArgs: { id: '1' } }));

      expect(mockUseTanstackQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: false,
        })
      );

      expect(mockUseApolloQuery).toHaveBeenCalledWith(
        mockGraphqlDocument,
        expect.objectContaining({
          skip: false,
          fetchPolicy: 'no-cache',
        })
      );
    });

    it('passes variables from graphqlVariables to Apollo query', () => {
      const useTestHook = createQueryHook<
        TestArgs,
        TestTRPCOutput,
        TestGraphQLData
      >(createTestConfig());

      renderHook(() => useTestHook({ queryArgs: { id: 'test-id' } }));

      expect(mockUseApolloQuery).toHaveBeenCalledWith(
        mockGraphqlDocument,
        expect.objectContaining({
          variables: { _eq: 'test-id' },
        })
      );
    });

    it('handles GraphQL refetch correctly', async () => {
      const newData: TestGraphQLData = { items: [{ id: '2', name: 'New' }] };

      mockGraphqlRefetch.mockResolvedValue({ data: newData, error: null });

      const useTestHook = createQueryHook<
        TestArgs,
        TestTRPCOutput,
        TestGraphQLData
      >(createTestConfig());

      const { result } = renderHook(() =>
        useTestHook({ queryArgs: { id: '1' } })
      );

      const refetchResult = await result.current.refetch();

      await waitFor(() => {
        expect(refetchResult.data).toEqual(newData);
        expect(refetchResult.error).toBeNull();
      });
    });
  });

  describe('skip behavior', () => {
    it('disables both queries when shouldSkip is true (TRPC enabled)', () => {
      mockUseIsFeatureFlagEnabled.mockReturnValue(true);

      const useTestHook = createQueryHook<
        TestArgs,
        TestTRPCOutput,
        TestGraphQLData
      >(createTestConfig());

      renderHook(() =>
        useTestHook({ queryArgs: { id: '1' }, shouldSkip: true })
      );

      expect(mockUseTanstackQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: false,
        })
      );

      expect(mockUseApolloQuery).toHaveBeenCalledWith(
        mockGraphqlDocument,
        expect.objectContaining({
          skip: true,
        })
      );
    });

    it('disables both queries when shouldSkip is true (GraphQL enabled)', () => {
      mockUseIsFeatureFlagEnabled.mockReturnValue(false);

      const useTestHook = createQueryHook<
        TestArgs,
        TestTRPCOutput,
        TestGraphQLData
      >(createTestConfig());

      renderHook(() =>
        useTestHook({ queryArgs: { id: '1' }, shouldSkip: true })
      );

      expect(mockUseTanstackQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: false,
        })
      );

      expect(mockUseApolloQuery).toHaveBeenCalledWith(
        mockGraphqlDocument,
        expect.objectContaining({
          skip: true,
        })
      );
    });

    it('defaults shouldSkip to false when not provided', () => {
      mockUseIsFeatureFlagEnabled.mockReturnValue(true);

      const useTestHook = createQueryHook<
        TestArgs,
        TestTRPCOutput,
        TestGraphQLData
      >(createTestConfig());

      renderHook(() => useTestHook({ queryArgs: { id: '1' } }));

      expect(mockUseTanstackQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: true,
        })
      );
    });
  });

  describe('configuration options', () => {
    it('uses custom fetchPolicy when provided', () => {
      mockUseIsFeatureFlagEnabled.mockReturnValue(false);

      const useTestHook = createQueryHook<
        TestArgs,
        TestTRPCOutput,
        TestGraphQLData
      >(createTestConfig({ graphqlFetchPolicy: 'cache-first' }));

      renderHook(() => useTestHook({ queryArgs: { id: '1' } }));

      expect(mockUseApolloQuery).toHaveBeenCalledWith(
        mockGraphqlDocument,
        expect.objectContaining({
          fetchPolicy: 'cache-first',
        })
      );
    });

    it('uses default no-cache fetchPolicy when not specified', () => {
      mockUseIsFeatureFlagEnabled.mockReturnValue(false);

      const config = createTestConfig();
      delete (config as { graphqlFetchPolicy?: string }).graphqlFetchPolicy;

      const useTestHook = createQueryHook<
        TestArgs,
        TestTRPCOutput,
        TestGraphQLData
      >(config);

      renderHook(() => useTestHook({ queryArgs: { id: '1' } }));

      expect(mockUseApolloQuery).toHaveBeenCalledWith(
        mockGraphqlDocument,
        expect.objectContaining({
          fetchPolicy: 'no-cache',
        })
      );
    });

    it('passes trpcStaleTime to TRPC query', () => {
      mockUseIsFeatureFlagEnabled.mockReturnValue(true);

      const useTestHook = createQueryHook<
        TestArgs,
        TestTRPCOutput,
        TestGraphQLData
      >(createTestConfig({ trpcStaleTime: 60000 }));

      renderHook(() => useTestHook({ queryArgs: { id: '1' } }));

      expect(mockUseTanstackQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          staleTime: 60000,
        })
      );
    });
  });

  describe('factory function behavior', () => {
    it('returns a hook function', () => {
      const useTestHook = createQueryHook<
        TestArgs,
        TestTRPCOutput,
        TestGraphQLData
      >(createTestConfig());

      expect(typeof useTestHook).toBe('function');
    });

    it('creates independent hook instances', () => {
      const useTestHook1 = createQueryHook<
        TestArgs,
        TestTRPCOutput,
        TestGraphQLData
      >(createTestConfig());

      const useTestHook2 = createQueryHook<
        TestArgs,
        TestTRPCOutput,
        TestGraphQLData
      >(createTestConfig());

      expect(useTestHook1).not.toBe(useTestHook2);
    });
  });

  describe('without graphqlVariables config', () => {
    beforeEach(() => {
      mockUseIsFeatureFlagEnabled.mockReturnValue(false);
    });

    it('passes undefined variables when graphqlVariables not provided', () => {
      const config = createTestConfig();
      delete (config as { graphqlVariables?: unknown }).graphqlVariables;

      const useTestHook = createQueryHook<
        TestArgs,
        TestTRPCOutput,
        TestGraphQLData
      >(config);

      renderHook(() => useTestHook({ queryArgs: { id: '1' } }));

      expect(mockUseApolloQuery).toHaveBeenCalledWith(
        mockGraphqlDocument,
        expect.objectContaining({
          variables: undefined,
        })
      );
    });
  });

  describe('mapGraphQLData behavior', () => {
    beforeEach(() => {
      mockUseIsFeatureFlagEnabled.mockReturnValue(false);
    });

    it('transforms GraphQL data when mapGraphQLData is provided', () => {
      const graphqlData: TestGraphQLData = {
        items: [
          { id: '1', name: 'Active' },
          { id: '2', name: 'Revoked' },
        ],
      };

      mockUseApolloQuery.mockReturnValue({
        data: graphqlData,
        loading: false,
        refetch: mockGraphqlRefetch,
        error: undefined,
      } as unknown as ReturnType<typeof useApolloQuery>);

      const useTestHook = createQueryHook<
        TestArgs,
        TestTRPCOutput,
        TestGraphQLData
      >(
        createTestConfig({
          mapGraphQLData: (data, args) => ({
            items: data.items.filter((item) => item.id === args.id),
          }),
        })
      );

      const { result } = renderHook(() =>
        useTestHook({ queryArgs: { id: '1' } })
      );

      expect(result.current.data).toEqual({
        items: [{ id: '1', name: 'Active' }],
      });
    });

    it('transforms GraphQL data on refetch when mapGraphQLData is provided', async () => {
      const newData: TestGraphQLData = {
        items: [
          { id: '1', name: 'Active' },
          { id: '2', name: 'Revoked' },
        ],
      };

      mockGraphqlRefetch.mockResolvedValue({ data: newData, error: null });

      const useTestHook = createQueryHook<
        TestArgs,
        TestTRPCOutput,
        TestGraphQLData
      >(
        createTestConfig({
          mapGraphQLData: (data, args) => ({
            items: data.items.filter((item) => item.id === args.id),
          }),
        })
      );

      const { result } = renderHook(() =>
        useTestHook({ queryArgs: { id: '1' } })
      );

      const refetchResult = await result.current.refetch();

      await waitFor(() => {
        expect(refetchResult.data).toEqual({
          items: [{ id: '1', name: 'Active' }],
        });
      });
    });

    it('returns GraphQL data directly when mapGraphQLData is not provided', () => {
      const graphqlData: TestGraphQLData = {
        items: [
          { id: '1', name: 'Active' },
          { id: '2', name: 'Revoked' },
        ],
      };

      mockUseApolloQuery.mockReturnValue({
        data: graphqlData,
        loading: false,
        refetch: mockGraphqlRefetch,
        error: undefined,
      } as unknown as ReturnType<typeof useApolloQuery>);

      const useTestHook = createQueryHook<
        TestArgs,
        TestTRPCOutput,
        TestGraphQLData
      >(createTestConfig());

      const { result } = renderHook(() =>
        useTestHook({ queryArgs: { id: '1' } })
      );

      expect(result.current.data).toEqual(graphqlData);
    });

    it('returns undefined when GraphQL data is undefined and mapGraphQLData is provided', () => {
      mockUseApolloQuery.mockReturnValue({
        data: undefined,
        loading: false,
        refetch: mockGraphqlRefetch,
        error: undefined,
      } as unknown as ReturnType<typeof useApolloQuery>);

      const useTestHook = createQueryHook<
        TestArgs,
        TestTRPCOutput,
        TestGraphQLData
      >(
        createTestConfig({
          mapGraphQLData: (data) => ({
            items: data.items.filter((item) => item.id === '1'),
          }),
        })
      );

      const { result } = renderHook(() =>
        useTestHook({ queryArgs: { id: '1' } })
      );

      expect(result.current.data).toBeUndefined();
    });

    it('does not use mapGraphQLData when TRPC is enabled', () => {
      mockUseIsFeatureFlagEnabled.mockReturnValue(true);

      const trpcData: TestTRPCOutput = [
        { id: '1', name: 'Active' },
        { id: '2', name: 'Revoked' },
      ];

      mockUseTanstackQuery.mockReturnValue({
        data: trpcData,
        isLoading: false,
        refetch: mockTrpcRefetch,
        error: null,
      } as unknown as ReturnType<typeof useQuery>);

      const mapGraphQLDataSpy = vi.fn((data: TestGraphQLData) => ({
        items: data.items.filter((item) => item.id === '1'),
      }));

      const useTestHook = createQueryHook<
        TestArgs,
        TestTRPCOutput,
        TestGraphQLData
      >(
        createTestConfig({
          mapGraphQLData: mapGraphQLDataSpy,
        })
      );

      const { result } = renderHook(() =>
        useTestHook({ queryArgs: { id: '1' } })
      );

      // mapGraphQLData should not be called when TRPC is enabled
      expect(mapGraphQLDataSpy).not.toHaveBeenCalled();
      // Data should be from TRPC, mapped via mapTrpcDataToGraphQL
      expect(result.current.data).toEqual({ items: trpcData });
    });
  });
});
