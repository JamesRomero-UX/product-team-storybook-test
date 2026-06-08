import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type {
  InsertAppetiteMutation,
  InsertAppetiteMutationVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { InsertAppetiteDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import type { InsertAppetiteTRPCInput } from './useInsertAppetiteTRPC';
import { useInsertAppetiteTRPC } from './useInsertAppetiteTRPC';

export const useInsertAppetite = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  // GraphQL mutation (legacy)
  const [insertAppetiteGraphQL, graphqlState] = useMutation(
    InsertAppetiteDocument,
    {
      update: (cache) => {
        evictField(cache, 'appetite');
        evictField(cache, 'appetite_aggregate');
        evictField(cache, 'risk_aggregate');
      },
      onError: (error) => {
        if (!trpcEnabled) {
          addNotification({
            type: 'error',
            content: error.message,
          });
        }
      },
    }
  );

  // tRPC mutation
  const trpcMutation = useInsertAppetiteTRPC();

  const insertAppetite = async (
    variables: InsertAppetiteMutationVariables
  ): Promise<InsertAppetiteMutation> => {
    if (trpcEnabled) {
      // Map GraphQL variables to tRPC input
      // ParentIds is typed as `string | string[]` by GraphQL codegen (inline variable coercion),
      // but callers always provide `string[]` — cast accordingly
      return trpcMutation.insertAppetite({
        ParentIds: variables.ParentIds as string[],
        AppetiteType: variables.AppetiteType!,
        Statement: variables.Statement,
        EffectiveDate: variables.EffectiveDate,
        LowerAppetite: variables.LowerAppetite,
        UpperAppetite: variables.UpperAppetite,
        ImpactAppetite: variables.ImpactAppetite,
        LikelihoodAppetite: variables.LikelihoodAppetite,
        ImpactId: variables.ImpactId,
        CustomAttributeData: variables.CustomAttributeData,
      } as InsertAppetiteTRPCInput);
    }

    const result = await insertAppetiteGraphQL({ variables });
    if (!result.data) {
      throw new Error('Failed to insert appetite');
    }

    return result.data;
  };

  // Return appropriate state based on feature flag
  if (trpcEnabled) {
    return {
      insertAppetite,
      loading: trpcMutation.loading,
      error: trpcMutation.error,
    };
  }

  return {
    insertAppetite,
    loading: graphqlState.loading,
    error: graphqlState.error,
  };
};
