import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { ScheduleTRPCInput } from '@risksmart-app/trpc/src/types';
import type {
  InsertChildRiskInput,
  InsertRiskMutation,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTRPC } from 'src/utils/trpc';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

type InsertRiskTRPCInput = Omit<InsertChildRiskInput, 'schedule'> &
  ScheduleTRPCInput;

/**
 * Maps TRPC mutation response to match the GraphQL mutation structure
 */
function mapTrpcResponseToGraphQL(trpcData: {
  Id: string;
}): InsertRiskMutation {
  return {
    insertChildRisk: {
      __typename: 'IdOutput',
      Id: trpcData.Id,
    },
  };
}

export const useInsertRiskTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.risk.insert.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.risk.register.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.risk.riskById.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.risk.scores.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.risk.riskListOnlyOptimized.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey:
            trpc.frontend.risk.riskListOnlyWithEntitiesOptimized.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.risk.riskScoresByRiskId.queryKey(),
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
    insertRisk: async (
      variables: InsertRiskTRPCInput
    ): Promise<InsertRiskMutation> => {
      const result = await mutation.mutateAsync(variables);

      return mapTrpcResponseToGraphQL(result);
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
