import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { DeleteIndicatorResultsMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { DeleteIndicatorResultsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import { useDeleteIndicatorResultsTRPC } from './useDeleteIndicatorResultsTRPC';

export const useDeleteIndicatorResults = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  const [deleteIndicatorResultsGraphQL, graphqlState] = useMutation(
    DeleteIndicatorResultsDocument,
    {
      update: (cache) => {
        evictField(cache, 'indicator_result');
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

  const trpcMutation = useDeleteIndicatorResultsTRPC();

  const deleteIndicatorResults = async (variables: {
    ids: string[];
  }): Promise<DeleteIndicatorResultsMutation> => {
    if (trpcEnabled) {
      return trpcMutation.deleteIndicatorResults(variables);
    }

    const result = await deleteIndicatorResultsGraphQL({
      variables: {
        ids: variables.ids,
      },
    });

    if (!result.data) {
      throw new Error('Failed to delete indicator results');
    }

    return result.data;
  };

  return {
    deleteIndicatorResults,
    loading: trpcEnabled ? trpcMutation.loading : graphqlState.loading,
    error: trpcEnabled ? trpcMutation.error : graphqlState.error,
  };
};
