import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import { mapScheduleToTRPC } from '@risksmart-app/trpc/src/types';
import type {
  UpdateChildRiskInput,
  UpdateRiskMutation,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  namedOperations,
  UpdateRiskDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import { useUpdateRiskTRPC } from './useUpdateRiskTRPC';

export const useUpdateRisk = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  // GraphQL mutation
  const [updateRiskGraphQL, graphqlState] = useMutation(UpdateRiskDocument, {
    update: (cache) => {
      evictField(cache, 'risk');
      evictField(cache, 'risk_score');
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
  const trpcMutation = useUpdateRiskTRPC();

  const updateRisk = async (
    variables: UpdateChildRiskInput
  ): Promise<UpdateRiskMutation> => {
    if (trpcEnabled) {
      const { schedule, ...rest } = variables;

      return trpcMutation.updateRisk({
        ...rest,
        ...mapScheduleToTRPC(schedule),
      });
    }

    const result = await updateRiskGraphQL({
      variables: { object: variables },
    });
    if (!result.data) {
      throw new Error('Failed to update risk');
    }

    return result.data;
  };

  // Return appropriate state based on feature flag
  if (trpcEnabled) {
    return {
      updateRisk,
      loading: trpcMutation.loading,
      error: trpcMutation.error,
    };
  }

  return {
    updateRisk,
    loading: graphqlState.loading,
    error: graphqlState.error,
  };
};
