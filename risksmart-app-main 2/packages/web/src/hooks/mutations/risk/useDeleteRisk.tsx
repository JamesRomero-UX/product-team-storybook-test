import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { DeleteRiskMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  DeleteRiskDocument,
  namedOperations,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import { useDeleteRiskTRPC } from './useDeleteRiskTRPC';

export const useDeleteRisk = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  // GraphQL mutation
  const [deleteRiskGraphQL, graphqlState] = useMutation(DeleteRiskDocument, {
    update: (cache) => {
      evictField(cache, 'risk');
      evictField(cache, 'risk_aggregate');
      evictField(cache, 'acceptance');
      evictField(cache, 'appetite');
      evictField(cache, 'appetite_aggregate');
      evictField(cache, 'impact_rating');
    },
    refetchQueries: [
      namedOperations.Query.getRiskById,
      namedOperations.Query.getRisksByTier,
    ],
    onError: (error) => {
      if (!trpcEnabled) {
        addNotification({
          type: 'error',
          content: error.message,
        });
      }
    },
  });

  // tRPC mutation
  const trpcMutation = useDeleteRiskTRPC();

  const deleteRisk = async (id: string): Promise<DeleteRiskMutation> => {
    if (trpcEnabled) {
      return trpcMutation.deleteRisk(id);
    }

    const result = await deleteRiskGraphQL({
      variables: { id },
    });
    if (!result.data) {
      throw new Error('Failed to delete risk');
    }

    return result.data;
  };

  // Return appropriate state based on feature flag
  if (trpcEnabled) {
    return {
      deleteRisk,
      loading: trpcMutation.loading,
      error: trpcMutation.error,
    };
  }

  return {
    deleteRisk,
    loading: graphqlState.loading,
    error: graphqlState.error,
  };
};
