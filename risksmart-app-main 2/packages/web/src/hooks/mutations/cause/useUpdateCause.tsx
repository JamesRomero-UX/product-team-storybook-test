import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type {
  UpdateCauseMutation,
  UpdateCauseMutationVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { UpdateCauseDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import type { UpdateCauseTRPCInput } from './useUpdateCauseTRPC';
import { useUpdateCauseTRPC } from './useUpdateCauseTRPC';

export const useUpdateCause = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  // GraphQL mutation (legacy)
  const [updateCauseGraphQL, graphqlState] = useMutation(UpdateCauseDocument, {
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
  const trpcMutation = useUpdateCauseTRPC();

  const updateCause = async (
    variables: UpdateCauseMutationVariables
  ): Promise<UpdateCauseMutation> => {
    if (trpcEnabled) {
      const trpcInput: UpdateCauseTRPCInput = {
        Id: variables.Id ?? '',
        ParentIssueId: variables.ParentIssueId ?? '',
        Title: variables.Title ?? '',
        Description: variables.Description,
        Significance: variables.Significance,
        CustomAttributeData: variables.CustomAttributeData ?? null,
        OriginalTimestamp: variables.OriginalTimestamp ?? '',
      };

      return trpcMutation.updateCause(trpcInput);
    }

    const result = await updateCauseGraphQL({ variables });
    if (!result.data) {
      throw new Error('Failed to update cause');
    }
    if (result.data.update_cause?.affected_rows !== 1) {
      throw new Error(
        'Records not updated. Record may have been updated by another user'
      );
    }

    return result.data;
  };

  // Return appropriate state based on feature flag
  if (trpcEnabled) {
    return {
      updateCause,
      loading: trpcMutation.loading,
      error: trpcMutation.error,
    };
  }

  return {
    updateCause,
    loading: graphqlState.loading,
    error: graphqlState.error,
  };
};
