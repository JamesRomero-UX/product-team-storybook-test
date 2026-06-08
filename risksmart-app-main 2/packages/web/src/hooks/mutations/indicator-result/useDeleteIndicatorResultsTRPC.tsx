import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { DeleteIndicatorResultsMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { useTRPC } from '@/utils/trpc';

/**
 * Maps TRPC mutation response to match the GraphQL mutation structure
 */
const mapTrpcResponseToGraphQL = (
  numIds: number
): DeleteIndicatorResultsMutation => ({
  delete_indicator_result: {
    __typename: 'indicator_result_mutation_response',
    affected_rows: numIds,
  },
});

export const useDeleteIndicatorResultsTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.indicator.deleteResults.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey:
            trpc.frontend.indicator.indicatorResultsByIndicatorId.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.indicator.indicatorById.queryKey(),
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
    deleteIndicatorResults: async (variables: {
      ids: string[];
    }): Promise<DeleteIndicatorResultsMutation> => {
      await mutation.mutateAsync(variables);

      return mapTrpcResponseToGraphQL(variables.ids.length);
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
