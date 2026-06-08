import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { DeleteCausesMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { useTRPC } from '@/utils/trpc';

const mapTrpcResponseToGraphQL = (count: number): DeleteCausesMutation => {
  return {
    delete_cause: {
      __typename: 'cause_mutation_response',
      affected_rows: count,
    },
  };
};

export const useDeleteCausesTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.cause.delete.mutationOptions({
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

  useEffect(() => {
    if (trpcEnabled && mutation.error) {
      addNotification({
        type: 'error',
        content: mutation.error.message,
      });
    }
  }, [trpcEnabled, mutation.error, addNotification]);

  return {
    deleteCauses: async (variables: {
      Ids: string[];
    }): Promise<DeleteCausesMutation> => {
      const result = await mutation.mutateAsync(variables);

      return mapTrpcResponseToGraphQL(result.deletedCount);
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
