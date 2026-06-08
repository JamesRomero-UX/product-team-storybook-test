import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { DeleteTestResultsMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { useTRPC } from '@/utils/trpc';

/**
 * Maps TRPC mutation response to match the GraphQL mutation structure
 */
const mapTrpcResponseToGraphQL = (
  numIds: number
): DeleteTestResultsMutation => ({
  delete_relation_file: {
    __typename: 'relation_file_mutation_response',
    affected_rows: numIds,
  },
  delete_test_result: {
    __typename: 'test_result_mutation_response',
    affected_rows: numIds,
  },
});

export const useDeleteTestResultsTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.testResult.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.testResult.testResultById.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.testResult.testResultsByControlId.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey:
            trpc.frontend.testResult.latestTestResultsByControlId.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.testResult.testResults.queryKey(),
        });
      },
    }),
    throwOnError: true,
  });

  // Handle TRPC errors
  useEffect(() => {
    if (trpcEnabled && mutation.error) {
      addNotification({
        type: 'error',
        content: mutation.error.message,
      });
    }
  }, [trpcEnabled, mutation.error, addNotification]);

  return {
    deleteTestResults: async (variables: {
      ids: string[];
    }): Promise<DeleteTestResultsMutation> => {
      await mutation.mutateAsync(variables);

      return mapTrpcResponseToGraphQL(variables.ids.length);
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
