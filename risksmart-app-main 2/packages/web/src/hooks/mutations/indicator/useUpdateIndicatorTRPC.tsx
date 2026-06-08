import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { ScheduleTRPCInput } from '@risksmart-app/trpc/src/types';
import type {
  UpdateChildIndicatorInput,
  UpdateIndicatorMutation,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTRPC } from 'src/utils/trpc';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

type UpdateIndicatorTRPCInput = Omit<
  UpdateChildIndicatorInput,
  'schedule' | 'Title' | 'Type'
> &
  ScheduleTRPCInput & {
    Title: string;
    Type: NonNullable<UpdateChildIndicatorInput['Type']>;
  };

const mapTrpcResponseToGraphQL = (trpcData: {
  Id: string;
}): UpdateIndicatorMutation => {
  return {
    updateChildIndicator: {
      __typename: 'IdOutput',
      Id: trpcData.Id,
    },
  };
};

export const useUpdateIndicatorTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.indicator.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.indicator.register.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.indicator.indicatorById.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.indicator.indicatorsByParentId.queryKey(),
        });
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
  }, [mutation.error, addNotification, trpcEnabled]);

  return {
    updateIndicator: async (
      variables: UpdateIndicatorTRPCInput
    ): Promise<UpdateIndicatorMutation> => {
      const result = await mutation.mutateAsync(variables);

      return mapTrpcResponseToGraphQL(result);
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
