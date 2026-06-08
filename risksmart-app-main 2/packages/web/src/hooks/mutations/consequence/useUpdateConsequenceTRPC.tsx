import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { ConsequenceType } from '@risksmart-app/domain/src/types/consts/consequence-type';
import type { CostType } from '@risksmart-app/domain/src/types/consts/cost-type';
import type { UpdateConsequenceMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTRPC } from 'src/utils/trpc';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

export type UpdateConsequenceTRPCInput = {
  Id: string;
  ParentIssueId: string;
  Title: string;
  Description?: string | null;
  Criticality?: number | null;
  CostType: CostType;
  CostValue: number;
  Type?: ConsequenceType | null;
  CustomAttributeData?: Record<string, unknown> | null;
  OriginalTimestamp: string;
};

/**
 * Maps TRPC mutation response to match the GraphQL mutation structure
 */
const mapTrpcResponseToGraphQL = (): UpdateConsequenceMutation => {
  return {
    update_consequence: {
      __typename: 'consequence_mutation_response',
      affected_rows: 1,
    },
  };
};

export const useUpdateConsequenceTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.consequence.update.mutationOptions({
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
    updateConsequence: async (
      variables: UpdateConsequenceTRPCInput
    ): Promise<UpdateConsequenceMutation> => {
      await mutation.mutateAsync(variables);

      return mapTrpcResponseToGraphQL();
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
