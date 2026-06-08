import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { DeleteControlGroupMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  DeleteControlGroupDocument,
  namedOperations,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import { useDeleteControlGroupTRPC } from './useDeleteControlGroupTRPC';

export const useDeleteControlGroup = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  // GraphQL mutation
  const [deleteControlGroupGraphQL, graphqlState] = useMutation(
    DeleteControlGroupDocument,
    {
      update: (cache) => evictField(cache, 'control_group'),
      refetchQueries: [namedOperations.Query.getControlById],
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
  const trpcMutation = useDeleteControlGroupTRPC();

  const deleteControlGroup = async (
    id: string,
    modifiedAtTimestamp: string
  ): Promise<DeleteControlGroupMutation> => {
    if (trpcEnabled) {
      // todo pass modifiedAtTimestamp when supported in tRPC
      return trpcMutation.deleteControlGroup({
        id,
        modifiedAtTimestamp,
      });
    }

    const result = await deleteControlGroupGraphQL({
      variables: { id, original_timestamp: modifiedAtTimestamp },
    });
    if (!result.data) {
      throw new Error('Failed to delete control group');
    }

    return result.data;
  };

  // Return appropriate state based on feature flag
  if (trpcEnabled) {
    return {
      deleteControlGroup,
      loading: trpcMutation.loading,
      error: trpcMutation.error,
    };
  }

  return {
    deleteControlGroup,
    loading: graphqlState.loading,
    error: graphqlState.error,
  };
};
