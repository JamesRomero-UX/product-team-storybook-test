import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { DeleteImpactMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { useTRPC } from '@/utils/trpc';

export const useDeleteObligationImpactTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.obligationImpact.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.obligationImpact.getByParentId.queryKey(),
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
    deleteObligationImpacts: async (variables: {
      ids: string[];
    }): Promise<DeleteImpactMutation> => {
      await mutation.mutateAsync(variables);

      return mapTrpcResponseToGraphQL();
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};

function mapTrpcResponseToGraphQL(): DeleteImpactMutation {
  return {
    delete_impact: {
      __typename: 'impact_mutation_response',
      affected_rows: 1,
    },
  };
}
