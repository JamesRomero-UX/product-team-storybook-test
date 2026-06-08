import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { ControlType } from '@risksmart-app/domain/src/types/consts';
import type { ScheduleTRPCInput } from '@risksmart-app/trpc/src/types';
import type {
  InsertChildControlInput,
  InsertChildControlMutation,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTRPC } from 'src/utils/trpc';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

type InsertControlTRPCInput = Omit<
  InsertChildControlInput,
  'schedule' | 'Type'
> &
  ScheduleTRPCInput & {
    Type?: ControlType | null;
  };

/**
 * Maps TRPC mutation response to match the GraphQL mutation structure
 */
function mapTrpcResponseToGraphQL(trpcData: {
  Id: string;
}): InsertChildControlMutation {
  return {
    insertChildControl: {
      __typename: 'IdOutput',
      Id: trpcData.Id,
    },
  };
}

export const useInsertControlTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.control.insert.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.control.register.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.control.controlById.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.control.controlsByUserId.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.control.controlsBasic.queryKey(),
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
    insertControl: async (
      variables: InsertControlTRPCInput
    ): Promise<InsertChildControlMutation> => {
      const result = await mutation.mutateAsync(variables);

      return mapTrpcResponseToGraphQL(result);
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
