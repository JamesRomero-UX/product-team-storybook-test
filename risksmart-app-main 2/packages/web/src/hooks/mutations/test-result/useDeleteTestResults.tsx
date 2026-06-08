import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { DeleteTestResultsMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { DeleteTestResultsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import { useDeleteTestResultsTRPC } from './useDeleteTestResultsTRPC';

export const useDeleteTestResults = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  const [deleteTestResultsGraphQL, graphqlState] = useMutation(
    DeleteTestResultsDocument,
    {
      update: (cache) => {
        evictField(cache, 'test_result');
        evictField(cache, 'test_result_aggregate');
        evictField(cache, 'control');
        evictField(cache, 'risk_score');
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

  const trpcMutation = useDeleteTestResultsTRPC();

  const deleteTestResults = async (variables: {
    ids: string[];
  }): Promise<DeleteTestResultsMutation> => {
    if (trpcEnabled) {
      return trpcMutation.deleteTestResults(variables);
    }

    const result = await deleteTestResultsGraphQL({
      variables: {
        Ids: variables.ids,
      },
    });

    if (!result.data) {
      throw new Error('Failed to delete test results');
    }

    return result.data;
  };

  return {
    deleteTestResults,
    loading: trpcEnabled ? trpcMutation.loading : graphqlState.loading,
    error: trpcEnabled ? trpcMutation.error : graphqlState.error,
  };
};
