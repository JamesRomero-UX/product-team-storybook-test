import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type {
  Acceptance_Status_Enum,
  InsertAcceptanceMutation,
  InsertAcceptanceMutationVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTRPC } from 'src/utils/trpc';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

type InsertAcceptanceTRPCInput = Omit<
  InsertAcceptanceMutationVariables,
  'Title' | 'Details' | 'Status'
> & {
  Title: string;
  Details: string;
  Status: Acceptance_Status_Enum;
};

/**
 * Maps TRPC mutation response to match the GraphQL mutation structure
 */
const mapTrpcResponseToGraphQL = (trpcData: {
  Id: string;
}): InsertAcceptanceMutation => {
  return {
    insertChildAcceptance: {
      __typename: 'IdOutput',
      Id: trpcData.Id,
    },
  };
};

export const useInsertAcceptanceTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.acceptance.insert.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.acceptance.register.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.acceptance.getById.queryKey(),
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
    insertAcceptance: async (
      variables: InsertAcceptanceMutationVariables
    ): Promise<InsertAcceptanceMutation> => {
      const { Title, Details, Status, ...rest } = variables;
      if (!Title) {
        throw new Error('Title is required for acceptance insert');
      }
      if (!Details) {
        throw new Error('Details is required for acceptance insert');
      }
      if (!Status) {
        throw new Error('Status is required for acceptance insert');
      }

      const input: InsertAcceptanceTRPCInput = {
        ...rest,
        Title,
        Details,
        Status,
      };

      const result = await mutation.mutateAsync(input);

      return mapTrpcResponseToGraphQL(result);
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
