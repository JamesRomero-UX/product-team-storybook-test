import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type {
  Appetite_Type_Enum,
  UpdateAppetiteMutation,
  UpdateAppetiteMutationVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { useTRPC } from '@/utils/trpc';

export type UpdateAppetiteTRPCInput = Omit<
  UpdateAppetiteMutationVariables,
  'OriginalTimestamp' | 'AppetiteType' | 'CustomAttributeData'
> & {
  AppetiteType: Appetite_Type_Enum;
  CustomAttributeData?: Record<string, unknown> | null;
};

const mapTrpcResponseToGraphQL = (): UpdateAppetiteMutation => {
  return {
    update_appetite: {
      __typename: 'appetite_mutation_response',
      affected_rows: 1,
    },
  };
};

export const useUpdateAppetiteTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.appetite.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.appetite.register.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.appetite.getById.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.appetite.appetitesByRiskId.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.appetite.activeAppetitesByParentId.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey:
            trpc.frontend.appetite.getAppetitesGroupedByImpact.queryKey(),
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
  }, [mutation.error, addNotification, trpcEnabled]);

  return {
    updateAppetite: async (
      variables: UpdateAppetiteTRPCInput
    ): Promise<UpdateAppetiteMutation> => {
      await mutation.mutateAsync(variables);

      return mapTrpcResponseToGraphQL();
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
