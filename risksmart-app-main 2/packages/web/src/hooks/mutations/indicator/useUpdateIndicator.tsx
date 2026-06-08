import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import { mapScheduleToTRPC } from '@risksmart-app/trpc/src/types';
import type {
  UpdateChildIndicatorInput,
  UpdateIndicatorMutation,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { UpdateIndicatorDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import { useUpdateIndicatorTRPC } from './useUpdateIndicatorTRPC';

export const useUpdateIndicator = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  const [updateIndicatorGraphQL, graphqlState] = useMutation(
    UpdateIndicatorDocument,
    {
      update: (cache) => {
        evictField(cache, 'indicator');
      },
      onError: (error) => {
        if (!trpcEnabled) {
          addNotification({
            type: 'error',
            content: error.message,
          });
        }
      },
    }
  );

  const trpcMutation = useUpdateIndicatorTRPC();

  const updateIndicator = async (
    variables: UpdateChildIndicatorInput
  ): Promise<UpdateIndicatorMutation> => {
    if (trpcEnabled) {
      const { schedule, Title, Type, ...rest } = variables;
      if (!Title || !Type) {
        throw new Error('Title and Type are required for indicator update');
      }

      return trpcMutation.updateIndicator({
        ...rest,
        Title,
        Type,
        ...mapScheduleToTRPC(schedule),
      });
    }

    const result = await updateIndicatorGraphQL({
      variables: { object: variables },
    });
    if (!result.data) {
      throw new Error('Failed to update indicator');
    }

    return result.data;
  };

  if (trpcEnabled) {
    return {
      updateIndicator,
      loading: trpcMutation.loading,
      error: trpcMutation.error,
    };
  }

  return {
    updateIndicator,
    loading: graphqlState.loading,
    error: graphqlState.error,
  };
};
