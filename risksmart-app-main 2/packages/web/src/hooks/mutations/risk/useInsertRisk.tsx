import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import { mapScheduleToTRPC } from '@risksmart-app/trpc/src/types';
import type {
  InsertChildRiskInput,
  InsertRiskMutation,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  InsertRiskDocument,
  namedOperations,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import { useInsertRiskTRPC } from './useInsertRiskTRPC';

export const useInsertRisk = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  // GraphQL mutation
  const [insertRiskGraphQL, graphqlState] = useMutation(InsertRiskDocument, {
    update: (cache) => {
      evictField(cache, 'risk');
      evictField(cache, 'risk_aggregate');
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
  const trpcMutation = useInsertRiskTRPC();

  const insertRisk = async (
    variables: InsertChildRiskInput
  ): Promise<InsertRiskMutation> => {
    if (trpcEnabled) {
      const { schedule, ...rest } = variables;

      return trpcMutation.insertRisk({
        ...rest,
        ...mapScheduleToTRPC(schedule),
      });
    }

    const result = await insertRiskGraphQL({
      variables: { object: variables },
    });
    if (!result.data) {
      throw new Error('Failed to insert risk');
    }

    return result.data;
  };

  // Return appropriate state based on feature flag
  if (trpcEnabled) {
    return {
      insertRisk,
      loading: trpcMutation.loading,
      error: trpcMutation.error,
    };
  }

  return {
    insertRisk,
    loading: graphqlState.loading,
    error: graphqlState.error,
  };
};
