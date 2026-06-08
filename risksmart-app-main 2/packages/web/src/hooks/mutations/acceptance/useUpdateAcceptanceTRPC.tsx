import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type {
  Acceptance_Status_Enum,
  UpdateAcceptanceMutation,
  UpdateAcceptanceMutationVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTRPC } from 'src/utils/trpc';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

export type UpdateAcceptanceTRPCInput = Omit<
  UpdateAcceptanceMutationVariables,
  'OriginalTimestamp' | 'Title' | 'Details' | 'Status' | 'CustomAttributeData'
> & {
  Title: string;
  Details: string;
  Status: Acceptance_Status_Enum;
  CustomAttributeData?: Record<string, unknown> | null;
};

/**
 * Maps TRPC mutation response to match the GraphQL mutation structure
 */
const mapTrpcResponseToGraphQL = (_trpcData: {
  Id: string;
}): UpdateAcceptanceMutation => {
  return {
    updateChildAcceptance: {
      __typename: 'GenericMutationOutput',
      affected_rows: 1,
    },
  };
};

export const useUpdateAcceptanceTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.acceptance.update.mutationOptions({
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
    updateAcceptance: async (
      variables: UpdateAcceptanceTRPCInput
    ): Promise<UpdateAcceptanceMutation> => {
      const result = await mutation.mutateAsync(variables);

      return mapTrpcResponseToGraphQL(result);
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
