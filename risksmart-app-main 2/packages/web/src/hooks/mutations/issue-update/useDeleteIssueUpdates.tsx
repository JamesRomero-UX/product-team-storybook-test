import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { DeleteIssueUpdatesMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { DeleteIssueUpdatesDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import { useDeleteIssueUpdatesTRPC } from './useDeleteIssueUpdatesTRPC';

export const useDeleteIssueUpdates = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  const [deleteIssueUpdatesGraphQL, graphqlState] = useMutation(
    DeleteIssueUpdatesDocument,
    {
      update: (cache) => {
        evictField(cache, 'issue_update');
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

  const trpcMutation = useDeleteIssueUpdatesTRPC();

  const deleteIssueUpdates = async (variables: {
    ids: string[];
  }): Promise<DeleteIssueUpdatesMutation> => {
    if (trpcEnabled) {
      return trpcMutation.deleteIssueUpdates(variables);
    }

    const result = await deleteIssueUpdatesGraphQL({
      variables: {
        Ids: variables.ids,
      },
    });

    if (!result.data) {
      throw new Error('Failed to delete issue updates');
    }

    return result.data;
  };

  return {
    deleteIssueUpdates,
    loading: trpcEnabled ? trpcMutation.loading : graphqlState.loading,
    error: trpcEnabled ? trpcMutation.error : graphqlState.error,
  };
};
