import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import { DeleteIssuesDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import { useDeleteIssuesTRPC } from './useDeleteIssuesTRPC';

export const useDeleteIssues = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  // GraphQL mutation
  const [deleteIssuesGraphQL, graphqlState] = useMutation(
    DeleteIssuesDocument,
    {
      update: (cache) => {
        evictField(cache, 'issue');
        evictField(cache, 'issue_aggregate');
        evictField(cache, 'issue_assessment_aggregate');
        evictField(cache, 'issue_assessment_audit');
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
  const trpcMutation = useDeleteIssuesTRPC();

  const deleteIssues = async (variables: { Ids: string[] }): Promise<void> => {
    if (trpcEnabled) {
      return trpcMutation.deleteIssues(variables);
    }

    const result = await deleteIssuesGraphQL({
      variables: {
        Ids: variables.Ids,
      },
    });

    if (!result.data) {
      throw new Error('Failed to delete issues');
    }
  };

  // Return appropriate state based on feature flag
  if (trpcEnabled) {
    return {
      deleteIssues,
      loading: trpcMutation.loading,
      error: trpcMutation.error,
    };
  }

  return {
    deleteIssues,
    loading: graphqlState.loading,
    error: graphqlState.error,
  };
};
