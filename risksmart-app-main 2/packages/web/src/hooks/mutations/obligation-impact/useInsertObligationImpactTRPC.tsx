import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { InsertObligationImpactMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { useTRPC } from '@/utils/trpc';

type InsertObligationImpactInput = {
  Description: string;
  ImpactRating: number;
  ParentObligationId: string;
  CustomAttributeData?: Record<string, unknown> | null;
};

export const useInsertObligationImpactTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.obligationImpact.insert.mutationOptions({
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
    insertObligationImpact: async (
      variables: InsertObligationImpactInput
    ): Promise<InsertObligationImpactMutation> => {
      const result = await mutation.mutateAsync(variables);

      return mapTrpcResponseToGraphQL(result);
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};

function mapTrpcResponseToGraphQL(trpcData: {
  Id: string;
}): InsertObligationImpactMutation {
  return {
    insert_obligation_impact_one: {
      __typename: 'obligation_impact',
      Id: trpcData.Id,
    },
  };
}
