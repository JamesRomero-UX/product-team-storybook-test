import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { DeleteRiskMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTRPC } from 'src/utils/trpc';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

const mapTrpcResponseToGraphQL = (): DeleteRiskMutation => {
  return {
    deleteRiskById: {
      __typename: 'GenericMutationOutput',
      // trpc should throw an error if no rows are affected
      affected_rows: 1,
    },
  };
};

export const useDeleteRiskTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.risk.delete.mutationOptions({
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
    deleteRisk: async (id: string): Promise<DeleteRiskMutation> => {
      await mutation.mutateAsync({ id });

      return mapTrpcResponseToGraphQL();
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
