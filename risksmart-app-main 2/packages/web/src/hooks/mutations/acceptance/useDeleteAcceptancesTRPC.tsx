import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { DeleteAcceptancesMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { useTRPC } from '@/utils/trpc';

const mapTrpcResponseToGraphQL = (): DeleteAcceptancesMutation => {
  return {
    deleteAcceptancesById: {
      __typename: 'GenericMutationOutput',
      affected_rows: 1,
    },
  };
};

export const useDeleteAcceptancesTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.acceptance.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.acceptance.register.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.acceptance.getById.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.acceptance.getByParentRiskId.queryKey(),
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
    deleteAcceptances: async (variables: {
      ids: string[];
    }): Promise<DeleteAcceptancesMutation> => {
      await mutation.mutateAsync(variables);

      return mapTrpcResponseToGraphQL();
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
