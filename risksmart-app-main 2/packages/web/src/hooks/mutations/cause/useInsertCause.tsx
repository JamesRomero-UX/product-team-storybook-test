import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type {
  InsertCauseMutation,
  InsertCauseMutationVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { InsertCauseDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import { useInsertCauseTRPC } from './useInsertCauseTRPC';

export const useInsertCause = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  // GraphQL mutation (legacy)
  const [insertCauseGraphQL, graphqlState] = useMutation(InsertCauseDocument, {
    update: (cache) => {
      evictField(cache, 'cause');
      evictField(cache, 'cause_aggregate');
    },
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
  const trpcMutation = useInsertCauseTRPC();

  const insertCause = async (
    variables: InsertCauseMutationVariables
  ): Promise<InsertCauseMutation> => {
    if (trpcEnabled) {
      return trpcMutation.insertCause({
        ParentIssueId: variables.ParentIssueId ?? '',
        Title: variables.Title ?? '',
        Description: variables.Description,
        Significance: variables.Significance,
        CustomAttributeData: variables.CustomAttributeData ?? null,
      });
    }

    const result = await insertCauseGraphQL({ variables });
    if (!result.data) {
      throw new Error('Failed to insert cause');
    }

    return result.data;
  };

  // Return appropriate state based on feature flag
  if (trpcEnabled) {
    return {
      insertCause,
      loading: trpcMutation.loading,
      error: trpcMutation.error,
    };
  }

  return {
    insertCause,
    loading: graphqlState.loading,
    error: graphqlState.error,
  };
};
