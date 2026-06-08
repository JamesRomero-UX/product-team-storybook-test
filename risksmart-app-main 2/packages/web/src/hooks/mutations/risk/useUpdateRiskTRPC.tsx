import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { ScheduleTRPCInput } from '@risksmart-app/trpc/src/types';
import type {
  UpdateChildRiskInput,
  UpdateRiskMutation,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTRPC } from 'src/utils/trpc';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

type UpdateRiskTRPCInput = Omit<UpdateChildRiskInput, 'schedule'> &
  ScheduleTRPCInput;

/**
 * Maps TRPC mutation response to match the GraphQL mutation structure
 */
const mapTrpcResponseToGraphQL = (trpcData: {
  Id: string;
}): UpdateRiskMutation => {
  return {
    updateChildRisk: {
      __typename: 'IdOutput',
      Id: trpcData.Id,
    },
  };
};

export const useUpdateRiskTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.risk.update.mutationOptions({
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
    updateRisk: async (
      variables: UpdateRiskTRPCInput
    ): Promise<UpdateRiskMutation> => {
      const result = await mutation.mutateAsync(variables);

      return mapTrpcResponseToGraphQL(result);
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
