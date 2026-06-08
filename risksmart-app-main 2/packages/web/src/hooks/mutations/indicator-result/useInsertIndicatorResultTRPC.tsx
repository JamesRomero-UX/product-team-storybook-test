import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { InsertIndicatorResultMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { useTRPC } from '@/utils/trpc';

type InsertIndicatorResultInput = {
  Description?: string | null;
  IndicatorId: string;
  ResultDate: string;
  TargetValueNum?: number | null;
  TargetValueTxt?: string | null;
  CustomAttributeData?: Record<string, unknown> | null;
};

export const useInsertIndicatorResultTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.indicator.insertResult.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey:
            trpc.frontend.indicator.indicatorResultsByIndicatorId.queryKey(),
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
    insertIndicatorResult: async (
      variables: InsertIndicatorResultInput
    ): Promise<InsertIndicatorResultMutation> => {
      const result = await mutation.mutateAsync(variables);

      return mapTrpcResponseToGraphQL(result);
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};

function mapTrpcResponseToGraphQL(trpcData: {
  Id: string;
}): InsertIndicatorResultMutation {
  return {
    insert_indicator_result_one: {
      __typename: 'indicator_result',
      Id: trpcData.Id,
    },
  };
}
