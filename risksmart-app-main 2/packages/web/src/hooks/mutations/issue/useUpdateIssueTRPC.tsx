import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { IssueTypes } from '@risksmart-app/trpc/src/services/service.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTRPC } from 'src/utils/trpc';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

interface UpdateIssueTRPCInput {
  Id: string;
  Title: string;
  DateIdentified: string;
  DateOccurred: string;
  Type: IssueTypes;
  OriginalTimestamp: string;
  Details?: string | null;
  ImpactsCustomer?: boolean | null;
  IsExternalIssue?: boolean | null;
  CustomAttributeData?: Record<string, unknown> | null;
  Meta?: Record<string, unknown> | null;
  OwnerUserIds?: string[];
  OwnerGroupIds?: string[];
  ContributorUserIds?: string[];
  ContributorGroupIds?: string[];
  TagTypeIds?: string[];
  DepartmentTypeIds?: string[];
}

export const useUpdateIssueTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.issue.update.mutationOptions({
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
  }, [mutation.error, addNotification, trpcEnabled]);

  return {
    updateIssue: async (variables: UpdateIssueTRPCInput): Promise<void> => {
      await mutation.mutateAsync(variables);
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
