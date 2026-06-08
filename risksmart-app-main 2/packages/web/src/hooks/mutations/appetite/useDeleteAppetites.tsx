import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { DeleteAppetitesMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { DeleteAppetitesDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import { useDeleteAppetitesTRPC } from './useDeleteAppetitesTRPC';

export const useDeleteAppetites = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  // GraphQL mutation (legacy)
  const [deleteAppetitesGraphQL, graphqlState] = useMutation(
    DeleteAppetitesDocument,
    {
      update: (cache) => {
        evictField(cache, 'appetite');
        evictField(cache, 'appetite_aggregate');
        evictField(cache, 'risk_aggregate');
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

  // tRPC mutation
  const trpcMutation = useDeleteAppetitesTRPC();

  const deleteAppetites = async (
    ids: string[]
  ): Promise<DeleteAppetitesMutation> => {
    if (trpcEnabled) {
      return trpcMutation.deleteAppetites({ ids });
    }

    const result = await deleteAppetitesGraphQL({
      variables: { Ids: ids },
    });

    if (!result.data) {
      throw new Error('Failed to delete appetites');
    }

    return result.data;
  };

  return {
    deleteAppetites,
    loading: trpcEnabled ? trpcMutation.loading : graphqlState.loading,
    error: trpcEnabled ? trpcMutation.error : graphqlState.error,
  };
};
