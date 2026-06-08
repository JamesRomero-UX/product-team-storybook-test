import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type {
  UpdateAppetiteMutation,
  UpdateAppetiteMutationVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { UpdateAppetiteDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import type { UpdateAppetiteTRPCInput } from './useUpdateAppetiteTRPC';
import { useUpdateAppetiteTRPC } from './useUpdateAppetiteTRPC';

export const useUpdateAppetite = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  // GraphQL mutation (legacy)
  const [updateAppetiteGraphQL, graphqlState] = useMutation(
    UpdateAppetiteDocument,
    {
      update: (cache) => {
        evictField(cache, 'appetite');
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
  const trpcMutation = useUpdateAppetiteTRPC();

  const updateAppetite = async (
    variables: UpdateAppetiteMutationVariables
  ): Promise<UpdateAppetiteMutation> => {
    if (trpcEnabled) {
      const {
        OriginalTimestamp: _OriginalTimestamp,
        AppetiteType,
        ...rest
      } = variables;
      if (!AppetiteType) {
        throw new Error('AppetiteType is required for appetite update');
      }
      const trpcInput: UpdateAppetiteTRPCInput = {
        ...rest,
        AppetiteType,
        CustomAttributeData: rest.CustomAttributeData ?? null,
      };

      return trpcMutation.updateAppetite(trpcInput);
    }

    const result = await updateAppetiteGraphQL({
      variables,
    });
    if (!result.data) {
      throw new Error('Failed to update appetite');
    }

    return result.data;
  };

  if (trpcEnabled) {
    return {
      updateAppetite,
      loading: trpcMutation.loading,
      error: trpcMutation.error,
    };
  }

  return {
    updateAppetite,
    loading: graphqlState.loading,
    error: graphqlState.error,
  };
};
