import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { AppetiteType } from '@risksmart-app/domain/src/types/consts/index';
import type { InsertAppetiteMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTRPC } from 'src/utils/trpc';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

// Base fields shared by all appetite types
interface AppetiteBaseInput {
  ParentIds: string[];
  Statement?: string | null;
  EffectiveDate?: string | null;
  CustomAttributeData?: Record<string, unknown> | null;
}

export type InsertAppetiteTRPCInput = AppetiteBaseInput &
  (
    | {
        AppetiteType: typeof AppetiteType.Risk;
        LowerAppetite?: number | null;
        UpperAppetite?: number | null;
      }
    | {
        AppetiteType: typeof AppetiteType.Impact;
        ImpactAppetite: number;
        ImpactId: string;
      }
    | {
        AppetiteType: typeof AppetiteType.Likelihood;
        LikelihoodAppetite?: number | null;
      }
  );

/**
 * Maps TRPC mutation response to match the GraphQL mutation structure
 */
function mapTrpcResponseToGraphQL(trpcData: {
  Id: string;
}): InsertAppetiteMutation {
  return {
    insertChildAppetite: {
      __typename: 'IdOutput',
      Id: trpcData.Id,
    },
  };
}

export const useInsertAppetiteTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.appetite.insert.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.appetite.register.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.appetite.appetitesByRiskId.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.appetite.activeAppetitesByParentId.queryKey(),
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
    insertAppetite: async (
      variables: InsertAppetiteTRPCInput
    ): Promise<InsertAppetiteMutation> => {
      const result = await mutation.mutateAsync(variables);

      return mapTrpcResponseToGraphQL(result);
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
