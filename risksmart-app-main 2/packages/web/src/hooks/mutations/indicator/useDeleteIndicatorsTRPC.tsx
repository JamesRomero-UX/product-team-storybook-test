import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { DeleteIndicatorsMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTRPC } from 'src/utils/trpc';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

const mapTrpcResponseToGraphQL = (
  deletedIds: string[]
): DeleteIndicatorsMutation => {
  return {
    delete_indicator_result: {
      __typename: 'indicator_result_mutation_response',
      affected_rows: 0,
    },
    delete_indicator: {
      __typename: 'indicator_mutation_response',
      affected_rows: deletedIds.length,
    },
  };
};

export const useDeleteIndicatorsTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.indicator.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.indicator.indicatorById.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.indicator.register.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.indicator.indicatorsByParentId.queryKey(),
        });
      },
    }),
    throwOnError: true,
  });

  useEffect(() => {
    if (trpcEnabled && mutation.error) {
      addNotification({
        type: 'error',
        content: mutation.error.message,
      });
    }
  }, [mutation.error, addNotification, trpcEnabled]);

  return {
    deleteIndicators: async (
      ids: string[]
    ): Promise<DeleteIndicatorsMutation> => {
      await mutation.mutateAsync({ ids });

      return mapTrpcResponseToGraphQL(ids);
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
