import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { InsertIssueUpdateMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { InsertIssueUpdateDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

import { useInsertIssueUpdateTRPC } from './useInsertIssueUpdateTRPC';

type InsertIssueUpdateInput = {
  ParentIssueId: string;
  Title: string;
  Description: string;
  CustomAttributeData?: Record<string, unknown> | null;
};

export const useInsertIssueUpdate = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  // GraphQL mutation
  const [insertIssueUpdateGraphQL, graphqlState] = useMutation(
    InsertIssueUpdateDocument,
    {
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
  const trpcMutation = useInsertIssueUpdateTRPC();

  const insertIssueUpdate = async (
    variables: InsertIssueUpdateInput
  ): Promise<InsertIssueUpdateMutation> => {
    if (trpcEnabled) {
      return trpcMutation.insertIssueUpdate(variables);
    }

    const result = await insertIssueUpdateGraphQL({ variables });
    if (!result.data) {
      throw new Error('Failed to insert issue update');
    }

    return result.data;
  };

  // Return appropriate state based on feature flag
  if (trpcEnabled) {
    return {
      insertIssueUpdate,
      loading: trpcMutation.loading,
      error: trpcMutation.error,
    };
  }

  return {
    insertIssueUpdate,
    loading: graphqlState.loading,
    error: graphqlState.error,
  };
};
