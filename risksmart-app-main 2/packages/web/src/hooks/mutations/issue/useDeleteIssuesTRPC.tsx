import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTRPC } from 'src/utils/trpc';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

export const useDeleteIssuesTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.issue.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.issue.register.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.issue.issueById.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.issue.issuesByParentId.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.issue.issueAssessmentByParentId.queryKey(),
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
  }, [trpcEnabled, mutation.error, addNotification]);

  return {
    deleteIssues: async (variables: { Ids: string[] }): Promise<void> => {
      await mutation.mutateAsync({ Ids: variables.Ids });
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
