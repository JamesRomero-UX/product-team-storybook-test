import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { DeleteAcceptancesMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { DeleteAcceptancesDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import { useDeleteAcceptancesTRPC } from './useDeleteAcceptancesTRPC';

export const useDeleteAcceptances = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  // GraphQL mutation (legacy)
  const [deleteAcceptancesGraphQL, graphqlState] = useMutation(
    DeleteAcceptancesDocument,
    {
      update: (cache) => {
        evictField(cache, 'acceptance');
        evictField(cache, 'acceptance_aggregate');
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
  const trpcMutation = useDeleteAcceptancesTRPC();

  const deleteAcceptances = async (
    ids: string[]
  ): Promise<DeleteAcceptancesMutation> => {
    if (trpcEnabled) {
      return trpcMutation.deleteAcceptances({ ids });
    }

    const result = await deleteAcceptancesGraphQL({
      variables: { Ids: ids },
    });

    if (!result.data) {
      throw new Error('Failed to delete acceptances');
    }

    return result.data;
  };

  return {
    deleteAcceptances,
    loading: trpcEnabled ? trpcMutation.loading : graphqlState.loading,
    error: trpcEnabled ? trpcMutation.error : graphqlState.error,
  };
};
