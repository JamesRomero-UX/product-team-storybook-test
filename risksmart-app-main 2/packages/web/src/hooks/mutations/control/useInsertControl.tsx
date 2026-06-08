import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { ControlType } from '@risksmart-app/domain/src/types/consts';
import { mapScheduleToTRPC } from '@risksmart-app/trpc/src/types';
import type {
  InsertChildControlInput,
  InsertChildControlMutation,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { InsertChildControlDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

type InsertControlInput = Omit<InsertChildControlInput, 'Type'> & {
  Type?: ControlType | null;
};

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import { useInsertControlTRPC } from './useInsertControlTRPC';

export const useInsertControl = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  // GraphQL mutation
  const [insertControlGraphQL, graphqlState] = useMutation(
    InsertChildControlDocument,
    {
      update: (cache) => {
        evictField(cache, 'risk');
        evictField(cache, 'control');
        evictField(cache, 'control_aggregate');
        evictField(cache, 'obligation');
        evictField(cache, 'linked_item');
        evictField(cache, 'risk_score');
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
  const trpcMutation = useInsertControlTRPC();

  const insertControl = async (
    variables: InsertControlInput
  ): Promise<InsertChildControlMutation> => {
    if (trpcEnabled) {
      const { schedule, ...rest } = variables;

      return trpcMutation.insertControl({
        ...rest,
        ...mapScheduleToTRPC(schedule),
      });
    }

    const result = await insertControlGraphQL({
      variables: { object: variables },
    });
    if (!result.data) {
      throw new Error('Failed to insert control');
    }

    return result.data;
  };

  // Return appropriate state based on feature flag
  if (trpcEnabled) {
    return {
      insertControl,
      loading: trpcMutation.loading,
      error: trpcMutation.error,
    };
  }

  return {
    insertControl,
    loading: graphqlState.loading,
    error: graphqlState.error,
  };
};
