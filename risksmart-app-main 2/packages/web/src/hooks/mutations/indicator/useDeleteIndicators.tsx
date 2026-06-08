import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { DeleteIndicatorsMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { DeleteIndicatorsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import { useDeleteIndicatorsTRPC } from './useDeleteIndicatorsTRPC';

export const useDeleteIndicators = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  const [deleteIndicatorsGraphQL, graphqlState] = useMutation(
    DeleteIndicatorsDocument,
    {
      update: (cache) => evictField(cache, 'indicator'),
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

  const trpcMutation = useDeleteIndicatorsTRPC();

  const deleteIndicators = async (
    ids: string[]
  ): Promise<DeleteIndicatorsMutation> => {
    if (trpcEnabled) {
      return trpcMutation.deleteIndicators(ids);
    }

    const result = await deleteIndicatorsGraphQL({
      variables: { ids },
    });
    if (!result.data) {
      throw new Error('Failed to delete indicators');
    }

    return result.data;
  };

  if (trpcEnabled) {
    return {
      deleteIndicators,
      loading: trpcMutation.loading,
      error: trpcMutation.error,
    };
  }

  return {
    deleteIndicators,
    loading: graphqlState.loading,
    error: graphqlState.error,
  };
};
