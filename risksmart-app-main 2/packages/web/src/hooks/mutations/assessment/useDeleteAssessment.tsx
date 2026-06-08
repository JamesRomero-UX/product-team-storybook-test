import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { DeleteAssessmentsMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  DeleteAssessmentsDocument,
  namedOperations,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import { useDeleteAssessmentTRPC } from './useDeleteAssessmentTRPC';

export const useDeleteAssessment = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  // GraphQL mutation
  const [deleteAssessmentGraphQL, graphqlState] = useMutation(
    DeleteAssessmentsDocument,
    {
      update: (cache) => {
        evictField(cache, 'assessment');
        evictField(cache, 'assessment_aggregate');
      },
      refetchQueries: [
        namedOperations.Query.getAssessmentById,
        namedOperations.Query.getAssessments,
      ],
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
  const trpcMutation = useDeleteAssessmentTRPC();

  const deleteAssessment = async (
    id: string
  ): Promise<DeleteAssessmentsMutation> => {
    if (trpcEnabled) {
      return trpcMutation.deleteAssessment(id);
    }

    const result = await deleteAssessmentGraphQL({
      variables: { Ids: [id] },
    });
    if (!result.data) {
      throw new Error('Failed to delete assessment');
    }

    return result.data;
  };

  // Return appropriate state based on feature flag
  if (trpcEnabled) {
    return {
      deleteAssessment,
      loading: trpcMutation.loading,
      error: trpcMutation.error,
    };
  }

  return {
    deleteAssessment,
    loading: graphqlState.loading,
    error: graphqlState.error,
  };
};
