import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { UpdateIndicatorResultMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { useTRPC } from '@/utils/trpc';

type UpdateIndicatorResultInput = {
  id: string;
  Description?: string | null;
  ResultDate: string;
  TargetValueNum?: number | null;
  TargetValueTxt?: string | null;
  CustomAttributeData?: Record<string, unknown> | null;
};

export const useUpdateIndicatorResultTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.indicator.updateResult.mutationOptions({
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
    updateIndicatorResult: async (
      variables: UpdateIndicatorResultInput
    ): Promise<UpdateIndicatorResultMutation> => {
      const { id, ...rest } = variables;
      const result = await mutation.mutateAsync({ Id: id, ...rest });

      return mapTrpcResponseToGraphQL(result);
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};

const mapTrpcResponseToGraphQL = (trpcData: {
  Id: string;
}): UpdateIndicatorResultMutation => {
  return {
    update_indicator_result: {
      __typename: 'indicator_result_mutation_response',
      returning: [
        {
          __typename: 'indicator_result',
          Id: trpcData.Id,
        },
      ],
    },
  };
};
