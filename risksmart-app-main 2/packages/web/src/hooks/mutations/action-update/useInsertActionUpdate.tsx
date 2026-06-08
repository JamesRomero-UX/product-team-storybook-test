import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { InsertActionUpdateMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { InsertActionUpdateDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

import { useInsertActionUpdateTRPC } from './useInsertActionUpdateTRPC';

type InsertActionUpdateInput = {
  ParentActionId: string;
  Title: string;
  Description: string;
  CustomAttributeData?: Record<string, unknown> | null;
};

export const useInsertActionUpdate = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  // GraphQL mutation
  const [insertActionUpdateGraphQL, graphqlState] = useMutation(
    InsertActionUpdateDocument,
    {
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
  const trpcMutation = useInsertActionUpdateTRPC();

  const insertActionUpdate = async (
    variables: InsertActionUpdateInput
  ): Promise<InsertActionUpdateMutation> => {
    if (trpcEnabled) {
      return trpcMutation.insertActionUpdate(variables);
    }

    const result = await insertActionUpdateGraphQL({ variables });
    if (!result.data) {
      throw new Error('Failed to insert action update');
    }

    return result.data;
  };

  // Return appropriate state based on feature flag
  if (trpcEnabled) {
    return {
      insertActionUpdate,
      loading: trpcMutation.loading,
      error: trpcMutation.error,
    };
  }

  return {
    insertActionUpdate,
    loading: graphqlState.loading,
    error: graphqlState.error,
  };
};
