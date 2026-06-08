import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type {
  UpdateAcceptanceMutation,
  UpdateAcceptanceMutationVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  namedOperations,
  UpdateAcceptanceDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import type { UpdateAcceptanceTRPCInput } from './useUpdateAcceptanceTRPC';
import { useUpdateAcceptanceTRPC } from './useUpdateAcceptanceTRPC';

export const useUpdateAcceptance = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  // GraphQL mutation (legacy)
  const [updateAcceptanceGraphQL, graphqlState] = useMutation(
    UpdateAcceptanceDocument,
    {
      update: (cache) => {
        evictField(cache, 'acceptance');
        evictField(cache, 'change_request');
      },
      refetchQueries: [namedOperations.Query.getAcceptanceById],
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
  const trpcMutation = useUpdateAcceptanceTRPC();

  const updateAcceptance = async (
    variables: UpdateAcceptanceMutationVariables
  ): Promise<UpdateAcceptanceMutation> => {
    if (trpcEnabled) {
      const {
        OriginalTimestamp: _OriginalTimestamp,
        Title,
        Details,
        Status,
        ...rest
      } = variables;
      if (!Status) {
        throw new Error('Status is required for acceptance update');
      }
      if (Title == null || Details == null) {
        throw new Error('Title and Details are required for acceptance update');
      }
      const trpcInput: UpdateAcceptanceTRPCInput = {
        ...rest,
        Title,
        Details,
        Status,
        CustomAttributeData: rest.CustomAttributeData ?? null,
      };

      return trpcMutation.updateAcceptance(trpcInput);
    }

    const result = await updateAcceptanceGraphQL({
      variables,
    });
    if (!result.data) {
      throw new Error('Failed to update acceptance');
    }

    return result.data;
  };

  // Return appropriate state based on feature flag
  if (trpcEnabled) {
    return {
      updateAcceptance,
      loading: trpcMutation.loading,
      error: trpcMutation.error,
    };
  }

  return {
    updateAcceptance,
    loading: graphqlState.loading,
    error: graphqlState.error,
  };
};
