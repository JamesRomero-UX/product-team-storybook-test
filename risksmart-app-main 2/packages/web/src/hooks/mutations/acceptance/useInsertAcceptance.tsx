import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type {
  InsertAcceptanceMutation,
  InsertAcceptanceMutationVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  InsertAcceptanceDocument,
  namedOperations,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import { useInsertAcceptanceTRPC } from './useInsertAcceptanceTRPC';

export const useInsertAcceptance = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  // GraphQL mutation (legacy)
  const [insertAcceptanceGraphQL, graphqlState] = useMutation(
    InsertAcceptanceDocument,
    {
      update: (cache) => {
        evictField(cache, 'acceptance');
        evictField(cache, 'acceptance_aggregate');
        evictField(cache, 'change_request');
      },
      refetchQueries: [namedOperations.Query.getAcceptanceById],
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
  const trpcMutation = useInsertAcceptanceTRPC();

  const insertAcceptance = async (
    variables: InsertAcceptanceMutationVariables
  ): Promise<InsertAcceptanceMutation> => {
    if (trpcEnabled) {
      return trpcMutation.insertAcceptance(variables);
    }

    const result = await insertAcceptanceGraphQL({ variables });
    if (!result.data) {
      throw new Error('Failed to insert acceptance');
    }

    return result.data;
  };

  // Return appropriate state based on feature flag
  if (trpcEnabled) {
    return {
      insertAcceptance,
      loading: trpcMutation.loading,
      error: trpcMutation.error,
    };
  }

  return {
    insertAcceptance,
    loading: graphqlState.loading,
    error: graphqlState.error,
  };
};
