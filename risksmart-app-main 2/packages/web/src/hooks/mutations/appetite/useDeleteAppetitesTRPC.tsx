import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { DeleteAppetitesMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { useTRPC } from '@/utils/trpc';

const mapTrpcResponseToGraphQL = (): DeleteAppetitesMutation => {
  return {
    delete_appetite: {
      __typename: 'appetite_mutation_response',
      affected_rows: 1,
    },
  };
};

export const useDeleteAppetitesTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.appetite.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.appetite.register.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.appetite.getById.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.appetite.appetitesByRiskId.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.appetite.activeAppetitesByParentId.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey:
            trpc.frontend.appetite.getAppetitesGroupedByImpact.queryKey(),
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
  }, [trpcEnabled, mutation.error, addNotification]);

  return {
    deleteAppetites: async (variables: {
      ids: string[];
    }): Promise<DeleteAppetitesMutation> => {
      await mutation.mutateAsync(variables);

      return mapTrpcResponseToGraphQL();
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
