import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { InsertChildActionMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  InsertChildActionDocument,
  namedOperations,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import type { InsertChildActionTRPCInput } from './useInsertChildActionTRPC';
import { useInsertChildActionTRPC } from './useInsertChildActionTRPC';

export const useInsertChildAction = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  // GraphQL mutation
  const [insertActionGraphQL, graphqlState] = useMutation(
    InsertChildActionDocument,
    {
      update: (cache) => {
        evictField(cache, 'action');
        evictField(cache, 'action_aggregate');
      },
      refetchQueries: [namedOperations.Query.getActionById],
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
  const trpcMutation = useInsertChildActionTRPC();

  const insertChildAction = async (
    variables: InsertChildActionTRPCInput
  ): Promise<InsertChildActionMutation> => {
    if (trpcEnabled) {
      return trpcMutation.insertChildAction(variables);
    }

    const result = await insertActionGraphQL({
      variables,
    });
    if (!result.data) {
      throw new Error('Failed to insert action');
    }

    return result.data;
  };

  // Return appropriate state based on feature flag
  if (trpcEnabled) {
    return {
      insertChildAction,
      loading: trpcMutation.loading,
      error: trpcMutation.error,
    };
  }

  return {
    insertChildAction,
    loading: graphqlState.loading,
    error: graphqlState.error,
  };
};
