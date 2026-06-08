import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { DeleteCausesMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { DeleteCausesDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import { useDeleteCausesTRPC } from './useDeleteCausesTRPC';

export const useDeleteCauses = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  // GraphQL mutation (legacy)
  const [deleteCausesGraphQL, graphqlState] = useMutation(
    DeleteCausesDocument,
    {
      update: (cache) => {
        evictField(cache, 'cause');
        evictField(cache, 'cause_aggregate');
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
  const trpcMutation = useDeleteCausesTRPC();

  const deleteCauses = async (ids: string[]): Promise<DeleteCausesMutation> => {
    if (trpcEnabled) {
      return trpcMutation.deleteCauses({ Ids: ids });
    }

    const result = await deleteCausesGraphQL({
      variables: { Ids: ids },
    });

    if (!result.data) {
      throw new Error('Failed to delete causes');
    }

    return result.data;
  };

  return {
    deleteCauses,
    loading: trpcEnabled ? trpcMutation.loading : graphqlState.loading,
    error: trpcEnabled ? trpcMutation.error : graphqlState.error,
  };
};
