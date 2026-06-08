import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type {
  InsertConsequenceMutation,
  InsertConsequenceMutationVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { InsertConsequenceDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import { useInsertConsequenceTRPC } from './useInsertConsequenceTRPC';

export const useInsertConsequence = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  // GraphQL mutation (legacy)
  const [insertConsequenceGraphQL, graphqlState] = useMutation(
    InsertConsequenceDocument,
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
  const trpcMutation = useInsertConsequenceTRPC();

  const insertConsequence = async (
    variables: InsertConsequenceMutationVariables
  ): Promise<InsertConsequenceMutation> => {
    if (trpcEnabled) {
      return trpcMutation.insertConsequence({
        ParentIssueId: variables.ParentIssueId ?? '',
        Title: variables.Title ?? '',
        Description: variables.Description,
        Criticality: variables.Criticality,
        CostType: variables.CostType!,
        CostValue: variables.CostValue ?? 0,
        Type: variables.Type,
        CustomAttributeData: variables.CustomAttributeData ?? null,
      });
    }

    const result = await insertConsequenceGraphQL({ variables });
    if (!result.data) {
      throw new Error('Failed to insert consequence');
    }

    return result.data;
  };

  // Return appropriate state based on feature flag
  if (trpcEnabled) {
    return {
      insertConsequence,
      loading: trpcMutation.loading,
      error: trpcMutation.error,
    };
  }

  return {
    insertConsequence,
    loading: graphqlState.loading,
    error: graphqlState.error,
  };
};
