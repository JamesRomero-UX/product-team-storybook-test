import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { InsertCauseMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTRPC } from 'src/utils/trpc';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

type InsertCauseTRPCInput = {
  ParentIssueId: string;
  Title: string;
  Description?: string | null;
  Significance?: number | null;
  CustomAttributeData?: Record<string, unknown> | null;
};

/**
 * Maps TRPC mutation response to match the GraphQL mutation structure
 */
const mapTrpcResponseToGraphQL = (trpcData: {
  Id: string;
}): InsertCauseMutation => {
  return {
    insert_cause: {
      __typename: 'cause_mutation_response',
      returning: [{ __typename: 'cause', Id: trpcData.Id }],
    },
  };
};

export const useInsertCauseTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.cause.insert.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.cause.register.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.cause.getById.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.cause.getByParentIssueId.queryKey(),
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
    insertCause: async (
      variables: InsertCauseTRPCInput
    ): Promise<InsertCauseMutation> => {
      const result = await mutation.mutateAsync(variables);

      return mapTrpcResponseToGraphQL(result);
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
