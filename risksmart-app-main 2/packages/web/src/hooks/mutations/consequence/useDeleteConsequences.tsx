import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { DeleteConsequencesMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { DeleteConsequencesDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import { useDeleteConsequencesTRPC } from './useDeleteConsequencesTRPC';

export const useDeleteConsequences = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  // GraphQL mutation (legacy)
  const [deleteConsequencesGraphQL, graphqlState] = useMutation(
    DeleteConsequencesDocument,
    {
      update: (cache) => {
        evictField(cache, 'consequence');
        evictField(cache, 'consequence_aggregate');
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
  const trpcMutation = useDeleteConsequencesTRPC();

  const deleteConsequences = async (
    ids: string[]
  ): Promise<DeleteConsequencesMutation> => {
    if (trpcEnabled) {
      return trpcMutation.deleteConsequences({ Ids: ids });
    }

    const result = await deleteConsequencesGraphQL({
      variables: { Ids: ids },
    });

    if (!result.data) {
      throw new Error('Failed to delete consequences');
    }

    return result.data;
  };

  return {
    deleteConsequences,
    loading: trpcEnabled ? trpcMutation.loading : graphqlState.loading,
    error: trpcEnabled ? trpcMutation.error : graphqlState.error,
  };
};
