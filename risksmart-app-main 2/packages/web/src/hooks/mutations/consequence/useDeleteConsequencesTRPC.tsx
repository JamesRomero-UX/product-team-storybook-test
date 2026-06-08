import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { DeleteConsequencesMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { useTRPC } from '@/utils/trpc';

const mapTrpcResponseToGraphQL = (
  count: number
): DeleteConsequencesMutation => {
  return {
    delete_consequence: {
      __typename: 'consequence_mutation_response',
      affected_rows: count,
    },
  };
};

export const useDeleteConsequencesTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.consequence.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.consequence.register.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.consequence.consequenceById.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.consequence.getByParentIssueId.queryKey(),
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
    deleteConsequences: async (variables: {
      Ids: string[];
    }): Promise<DeleteConsequencesMutation> => {
      const result = await mutation.mutateAsync(variables);

      return mapTrpcResponseToGraphQL(result.deletedCount);
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
