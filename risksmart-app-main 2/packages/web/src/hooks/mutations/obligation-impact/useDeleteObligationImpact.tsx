import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { DeleteImpactsMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { DeleteImpactsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import { useDeleteObligationImpactTRPC } from './useDeleteObligationImpactTRPC';

export const useDeleteObligationImpact = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  const [deleteObligationImpactsGraphQL, graphqlState] = useMutation(
    DeleteImpactsDocument,
    {
      update: (cache) => {
        evictField(cache, 'obligation_impact');
        evictField(cache, 'obligation');
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

  const trpcMutation = useDeleteObligationImpactTRPC();

  const deleteObligationImpacts = async (variables: {
    ids: string[];
  }): Promise<DeleteImpactsMutation> => {
    if (trpcEnabled) {
      return trpcMutation.deleteObligationImpacts(variables);
    }

    const result = await deleteObligationImpactsGraphQL({
      variables: {
        Ids: variables.ids,
      },
    });

    if (!result.data) {
      throw new Error('Failed to delete obligation impact');
    }

    return result.data;
  };

  return {
    deleteObligationImpacts,
    loading: trpcEnabled ? trpcMutation.loading : graphqlState.loading,
    error: trpcEnabled ? trpcMutation.error : graphqlState.error,
  };
};
