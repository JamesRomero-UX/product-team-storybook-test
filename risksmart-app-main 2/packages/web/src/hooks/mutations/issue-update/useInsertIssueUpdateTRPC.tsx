import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { InsertIssueUpdateMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTRPC } from 'src/utils/trpc';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

type InsertIssueUpdateInput = {
  ParentIssueId: string;
  Title: string;
  Description: string;
  CustomAttributeData?: Record<string, unknown> | null;
};

/**
 * Maps TRPC mutation response to match the GraphQL mutation structure
 */
function mapTrpcResponseToGraphQL(trpcData: {
  Id: string;
}): InsertIssueUpdateMutation {
  return {
    insert_issue_update_one: {
      __typename: 'issue_update',
      Id: trpcData.Id,
    },
  };
}

export const useInsertIssueUpdateTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.issueUpdate.insert.mutationOptions({
      onSuccess: async () => {
        // Invalidate issue update queries to refresh data
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.issueUpdate.getById.queryKey(),
        });
      },
    }),
    throwOnError: true,
  });

  // Handle TRPC errors
  useEffect(() => {
    if (trpcEnabled && mutation.error) {
      addNotification({
        type: 'error',
        content: mutation.error.message,
      });
    }
  }, [mutation.error, addNotification, trpcEnabled]);

  return {
    insertIssueUpdate: async (
      variables: InsertIssueUpdateInput
    ): Promise<InsertIssueUpdateMutation> => {
      const result = await mutation.mutateAsync(variables);

      return mapTrpcResponseToGraphQL(result);
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
