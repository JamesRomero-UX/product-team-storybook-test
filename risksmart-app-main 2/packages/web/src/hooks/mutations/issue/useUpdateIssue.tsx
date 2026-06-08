import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { IssueTypes } from '@risksmart-app/trpc/src/services/service.types';
import {
  namedOperations,
  UpdateIssueDocument,
  type UpdateIssueInput,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import { useUpdateIssueTRPC } from './useUpdateIssueTRPC';

interface UpdateIssueOptions {
  issueType: string;
}

export const useUpdateIssue = ({ issueType }: UpdateIssueOptions) => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  // GraphQL mutation
  const [updateIssueGraphQL, graphqlState] = useMutation(UpdateIssueDocument, {
    update: (cache) => {
      evictField(cache, 'issue');
    },
    refetchQueries: [namedOperations.Query.getIssueById],
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
  const trpcMutation = useUpdateIssueTRPC();

  const updateIssue = async (variables: UpdateIssueInput): Promise<void> => {
    if (trpcEnabled) {
      await trpcMutation.updateIssue({
        ...variables,
        Type: issueType as IssueTypes,
      });

      return;
    }

    const result = await updateIssueGraphQL({
      variables: { object: variables },
    });
    if (!result.data) {
      throw new Error('Failed to update issue');
    }
  };

  // Return appropriate state based on feature flag
  if (trpcEnabled) {
    return {
      updateIssue,
      loading: trpcMutation.loading,
      error: trpcMutation.error,
    };
  }

  return {
    updateIssue,
    loading: graphqlState.loading,
    error: graphqlState.error,
  };
};
