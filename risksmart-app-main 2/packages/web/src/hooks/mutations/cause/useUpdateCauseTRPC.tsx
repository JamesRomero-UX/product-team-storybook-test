import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { UpdateCauseMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTRPC } from 'src/utils/trpc';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

export type UpdateCauseTRPCInput = {
  Id: string;
  ParentIssueId: string;
  Title: string;
  Description?: string | null;
  Significance?: number | null;
  CustomAttributeData?: Record<string, unknown> | null;
  OriginalTimestamp: string;
};

/**
 * Maps TRPC mutation response to match the GraphQL mutation structure
 */
const mapTrpcResponseToGraphQL = (): UpdateCauseMutation => {
  return {
    update_cause: {
      __typename: 'cause_mutation_response',
      affected_rows: 1,
    },
  };
};

export const useUpdateCauseTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.cause.update.mutationOptions({
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
    updateCause: async (
      variables: UpdateCauseTRPCInput
    ): Promise<UpdateCauseMutation> => {
      await mutation.mutateAsync(variables);

      return mapTrpcResponseToGraphQL();
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
