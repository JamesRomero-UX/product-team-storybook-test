import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { ConsequenceType } from '@risksmart-app/domain/src/types/consts/consequence-type';
import type { CostType } from '@risksmart-app/domain/src/types/consts/cost-type';
import type { InsertConsequenceMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTRPC } from 'src/utils/trpc';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

type InsertConsequenceTRPCInput = {
  ParentIssueId: string;
  Title: string;
  Description?: string | null;
  Criticality?: number | null;
  CostType: CostType;
  CostValue: number;
  Type?: ConsequenceType | null;
  CustomAttributeData?: Record<string, unknown> | null;
};

/**
 * Maps TRPC mutation response to match the GraphQL mutation structure
 */
const mapTrpcResponseToGraphQL = (trpcData: {
  Id: string;
}): InsertConsequenceMutation => {
  return {
    insert_consequence_one: {
      __typename: 'consequence',
      Id: trpcData.Id,
    },
  };
};

export const useInsertConsequenceTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.consequence.insert.mutationOptions({
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
    insertConsequence: async (
      variables: InsertConsequenceTRPCInput
    ): Promise<InsertConsequenceMutation> => {
      const result = await mutation.mutateAsync(variables);

      return mapTrpcResponseToGraphQL(result);
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
