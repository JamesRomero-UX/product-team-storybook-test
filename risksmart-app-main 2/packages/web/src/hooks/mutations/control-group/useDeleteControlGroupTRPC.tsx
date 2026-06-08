import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { DeleteControlGroupMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTRPC } from 'src/utils/trpc';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

function mapTrpcResponseToGraphQL(): DeleteControlGroupMutation {
  return {
    delete_control_group: {
      __typename: 'control_group_mutation_response',
      // trpc should throw an error if no rows are affected
      affected_rows: 1,
    },
  };
}

export const useDeleteControlGroupTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.controlGroup.delete.mutationOptions({
      onSuccess: async () => {
        // Invalidate control group queries to refresh data
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.controlGroup.controlGroupById.queryKey(),
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
    deleteControlGroup: async ({
      id,
      modifiedAtTimestamp,
    }: {
      id: string;
      modifiedAtTimestamp: string;
    }): Promise<DeleteControlGroupMutation> => {
      await mutation.mutateAsync({
        id,
        originalTimestamp: modifiedAtTimestamp,
      });

      return mapTrpcResponseToGraphQL();
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
