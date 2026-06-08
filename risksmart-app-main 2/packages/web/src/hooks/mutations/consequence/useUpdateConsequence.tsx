import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type {
  UpdateConsequenceMutation,
  UpdateConsequenceMutationVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { UpdateConsequenceDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import type { UpdateConsequenceTRPCInput } from './useUpdateConsequenceTRPC';
import { useUpdateConsequenceTRPC } from './useUpdateConsequenceTRPC';

export const useUpdateConsequence = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  // GraphQL mutation (legacy)
  const [updateConsequenceGraphQL, graphqlState] = useMutation(
    UpdateConsequenceDocument,
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
  const trpcMutation = useUpdateConsequenceTRPC();

  const updateConsequence = async (
    variables: UpdateConsequenceMutationVariables
  ): Promise<UpdateConsequenceMutation> => {
    if (trpcEnabled) {
      const trpcInput: UpdateConsequenceTRPCInput = {
        Id: variables.Id ?? '',
        ParentIssueId: variables.ParentIssueId ?? '',
        Title: variables.Title ?? '',
        Description: variables.Description,
        Criticality: variables.Criticality,
        CostType: variables.CostType!,
        CostValue: variables.CostValue ?? 0,
        Type: variables.Type,
        CustomAttributeData: variables.CustomAttributeData ?? null,
        OriginalTimestamp: variables.OriginalTimestamp ?? '',
      };

      return trpcMutation.updateConsequence(trpcInput);
    }

    const result = await updateConsequenceGraphQL({ variables });
    if (!result.data) {
      throw new Error('Failed to update consequence');
    }
    if (result.data.update_consequence?.affected_rows !== 1) {
      throw new Error(
        'Records not updated. Record may have been updated by another user'
      );
    }

    return result.data;
  };

  // Return appropriate state based on feature flag
  if (trpcEnabled) {
    return {
      updateConsequence,
      loading: trpcMutation.loading,
      error: trpcMutation.error,
    };
  }

  return {
    updateConsequence,
    loading: graphqlState.loading,
    error: graphqlState.error,
  };
};
