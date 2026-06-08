import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { InsertControlGroupMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { InsertControlGroupDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

import { useInsertControlGroupTRPC } from './useInsertControlGroupTRPC';

type InsertControlGroupInput = {
  Title: string;
  Description: string;
  Owner: string;
  CustomAttributeData?: Record<string, unknown> | null;
};

export const useInsertControlGroup = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  const [insertControlGroupGraphQL, graphqlState] = useMutation(
    InsertControlGroupDocument,
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

  const trpcMutation = useInsertControlGroupTRPC();

  const insertControlGroup = async (
    variables: InsertControlGroupInput
  ): Promise<InsertControlGroupMutation> => {
    if (trpcEnabled) {
      return trpcMutation.insertControlGroup(variables);
    }

    const result = await insertControlGroupGraphQL({ variables });
    if (!result.data) {
      throw new Error('Failed to insert action update');
    }

    return result.data;
  };

  return {
    insertControlGroup,
    loading: trpcEnabled ? trpcMutation.loading : graphqlState.loading,
    error: trpcEnabled ? trpcMutation.error : graphqlState.error,
  };
};
