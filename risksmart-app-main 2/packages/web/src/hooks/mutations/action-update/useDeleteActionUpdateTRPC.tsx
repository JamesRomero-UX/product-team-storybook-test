import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { DeleteActionUpdatesMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTRPC } from 'src/utils/trpc';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

/**
 * Maps TRPC mutation response to match the GraphQL mutation structure
 */
function mapTrpcResponseToGraphQL(
  deletedIds: string[]
): DeleteActionUpdatesMutation {
  return {
    delete_file: {
      __typename: 'file_mutation_response',
      affected_rows: 0,
    },
    delete_relation_file: {
      __typename: 'relation_file_mutation_response',
      affected_rows: 0,
    },
    delete_action_update: {
      __typename: 'action_update_mutation_response',
      affected_rows: deletedIds.length,
    },
  };
}

export const useDeleteActionUpdateTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.action.updates.delete.mutationOptions({
      onSuccess: async () => {
        // Invalidate action update queries to refresh data
        await queryClient.invalidateQueries({
          queryKey:
            trpc.frontend.action.updates.getActionUpdatesByParentActionId.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.action.updates.getActionUpdateById.queryKey(),
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
  }, [mutation.error, addNotification, trpcEnabled]);

  return {
    /**
     * Delete action updates by IDs in a single batch request
     */
    deleteActionUpdates: async (
      ids: string[]
    ): Promise<DeleteActionUpdatesMutation> => {
      await mutation.mutateAsync({ ids });

      return mapTrpcResponseToGraphQL(ids);
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
