import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { InsertControlGroupMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { useTRPC } from '@/utils/trpc';

type InsertControlGroupInput = {
  Title: string;
  Description: string;
  Owner: string;
  CustomAttributeData?: Record<string, unknown> | null;
};

export const useInsertControlGroupTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.controlGroup.insert.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.controlGroup.controlGroups.queryKey(),
        });

        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.controlGroup.controlGroupById.queryKey(),
        });

        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.controlGroup.controlGroupsByTitle.queryKey(),
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
    insertControlGroup: async (
      variables: InsertControlGroupInput
    ): Promise<InsertControlGroupMutation> => {
      const result = await mutation.mutateAsync(variables);

      return mapTrpcResponseToGraphQL(result);
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};

function mapTrpcResponseToGraphQL(trpcData: {
  Id: string;
}): InsertControlGroupMutation {
  return {
    insert_control_group_one: {
      __typename: 'control_group',
      Id: trpcData.Id,
    },
  };
}
