import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { IssueTypes } from '@risksmart-app/trpc/src/services/service.types';
import type {
  InsertChildIssueMutation,
  InsertIssueInput,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTRPC } from 'src/utils/trpc';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

type InsertIssueTRPCInput = Omit<InsertIssueInput, 'Type'> & {
  Type: IssueTypes;
};

/**
 * Maps TRPC mutation response to match the GraphQL mutation structure
 */
function mapTrpcResponseToGraphQL(trpcData: {
  Id: string;
  SequentialId: number | null;
}): InsertChildIssueMutation {
  return {
    insertChildIssue: {
      __typename: 'InsertChildIssueOutput',
      Id: trpcData.Id,
      SequentialId: trpcData.SequentialId ?? 0,
    },
  };
}

export const useInsertChildIssueTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.issue.insert.mutationOptions({
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
    insertChildIssue: async (
      variables: InsertIssueTRPCInput
    ): Promise<InsertChildIssueMutation> => {
      const result = await mutation.mutateAsync(variables);

      return mapTrpcResponseToGraphQL(result);
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
