import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { DeleteActionUpdatesMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { DeleteActionUpdatesDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import { useDeleteActionUpdateTRPC } from './useDeleteActionUpdateTRPC';

export const useDeleteActionUpdate = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  // GraphQL mutation
  const [deleteActionUpdatesGraphQL, graphqlState] = useMutation(
    DeleteActionUpdatesDocument,
    {
      update: (cache) => evictField(cache, 'action_update'),
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

  // tRPC mutation
  const trpcMutation = useDeleteActionUpdateTRPC();

  const deleteActionUpdates = async (
    ids: string[]
  ): Promise<DeleteActionUpdatesMutation> => {
    if (trpcEnabled) {
      return trpcMutation.deleteActionUpdates(ids);
    }

    const result = await deleteActionUpdatesGraphQL({
      variables: { Ids: ids },
    });
    if (!result.data) {
      throw new Error('Failed to delete action updates');
    }

    return result.data;
  };

  // Return appropriate state based on feature flag
  if (trpcEnabled) {
    return {
      deleteActionUpdates,
      loading: trpcMutation.loading,
      error: trpcMutation.error,
    };
  }

  return {
    deleteActionUpdates,
    loading: graphqlState.loading,
    error: graphqlState.error,
  };
};
