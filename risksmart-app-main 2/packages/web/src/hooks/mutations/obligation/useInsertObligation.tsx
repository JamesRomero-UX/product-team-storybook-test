import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import { mapScheduleToTRPC } from '@risksmart-app/trpc/src/types';
import type {
  InsertChildObligationInput,
  InsertObligationMutation,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  InsertObligationDocument,
  namedOperations,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import { useInsertObligationTRPC } from './useInsertObligationTRPC';

export const useInsertObligation = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  const [insertObligationGraphQL, graphqlState] = useMutation(
    InsertObligationDocument,
    {
      update: (cache) => {
        evictField(cache, 'obligation');
      },
      refetchQueries: [
        namedOperations.Query.getObligationById,
        namedOperations.Query.getObligationsByType,
      ],
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

  const trpcMutation = useInsertObligationTRPC();

  const insertObligation = async (
    variables: InsertChildObligationInput
  ): Promise<InsertObligationMutation> => {
    if (trpcEnabled) {
      const { schedule, ...rest } = variables;

      return trpcMutation.insertObligation({
        ...rest,
        ...mapScheduleToTRPC(schedule),
      });
    }

    const result = await insertObligationGraphQL({
      variables: { object: variables },
    });
    if (!result.data) {
      throw new Error('Failed to insert obligation');
    }

    return result.data;
  };

  if (trpcEnabled) {
    return {
      insertObligation,
      loading: trpcMutation.loading,
      error: trpcMutation.error,
    };
  }

  return {
    insertObligation,
    loading: graphqlState.loading,
    error: graphqlState.error,
  };
};
