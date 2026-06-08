import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { InsertActionUpdateMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTRPC } from 'src/utils/trpc';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

type InsertActionUpdateInput = {
  ParentActionId: string;
  Title: string;
  Description: string;
  CustomAttributeData?: Record<string, unknown> | null;
};

/**
 * Maps TRPC mutation response to match the GraphQL mutation structure
 */
function mapTrpcResponseToGraphQL(trpcData: {
  Id: string;
}): InsertActionUpdateMutation {
  return {
    insert_action_update_one: {
      __typename: 'action_update',
      Id: trpcData.Id,
    },
  };
}

export const useInsertActionUpdateTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.action.updates.insert.mutationOptions({
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
    insertActionUpdate: async (
      variables: InsertActionUpdateInput
    ): Promise<InsertActionUpdateMutation> => {
      const result = await mutation.mutateAsync(variables);

      return mapTrpcResponseToGraphQL(result);
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
