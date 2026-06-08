import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { ScheduleTRPCInput } from '@risksmart-app/trpc/src/types';
import type {
  InsertChildObligationInput,
  InsertObligationMutation,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTRPC } from 'src/utils/trpc';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

type InsertObligationTRPCInput = Omit<InsertChildObligationInput, 'schedule'> &
  ScheduleTRPCInput;

function mapTrpcResponseToGraphQL(trpcData: {
  Id: string;
}): InsertObligationMutation {
  return {
    insertChildObligation: {
      __typename: 'IdOutput',
      Id: trpcData.Id,
    },
  };
}

export const useInsertObligationTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.obligation.insert.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.obligation.register.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.obligation.getById.queryKey(),
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
    insertObligation: async (
      variables: InsertObligationTRPCInput
    ): Promise<InsertObligationMutation> => {
      const result = await mutation.mutateAsync(variables);

      return mapTrpcResponseToGraphQL(result);
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
