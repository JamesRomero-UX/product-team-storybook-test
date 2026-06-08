import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { DeleteIssueUpdatesMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { useTRPC } from '@/utils/trpc';

export const useDeleteIssueUpdatesTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.issueUpdate.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.issueUpdate.register.queryKey(),
        });
      },
    }),
    throwOnError: true,
  });

  useEffect(() => {
    if (trpcEnabled && mutation.error) {
      addNotification({
        type: 'error',
        content: mutation.error.message,
      });
    }
  }, [trpcEnabled, mutation.error, addNotification]);

  return {
    deleteIssueUpdates: async (variables: {
      ids: string[];
    }): Promise<DeleteIssueUpdatesMutation> => {
      await mutation.mutateAsync(variables);

      return mapTrpcResponseToGraphQL(variables.ids.length);
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};

function mapTrpcResponseToGraphQL(numIds: number): DeleteIssueUpdatesMutation {
  return {
    delete_issue_update: {
      __typename: 'issue_update_mutation_response',
      affected_rows: numIds,
    },
  };
}
