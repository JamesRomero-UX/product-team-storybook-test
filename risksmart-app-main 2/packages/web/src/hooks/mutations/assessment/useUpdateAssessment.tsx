import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type {
  UpdateAssessmentInput,
  UpdateAssessmentMutation,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  namedOperations,
  UpdateAssessmentDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import { useUpdateAssessmentTRPC } from './useUpdateAssessmentTRPC';

export const useUpdateAssessment = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  // GraphQL mutation
  const [updateAssessmentGraphQL, graphqlState] = useMutation(
    UpdateAssessmentDocument,
    {
      update: (cache) => {
        evictField(cache, 'risk_assessment_result');
        evictField(cache, 'document_assessment_result');
        evictField(cache, 'obligation_assessment_result');
        evictField(cache, 'assessment');
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
  const trpcMutation = useUpdateAssessmentTRPC();

  const updateAssessment = async (
    variables: UpdateAssessmentInput
  ): Promise<UpdateAssessmentMutation> => {
    if (trpcEnabled) {
      return trpcMutation.updateAssessment({
        ...variables,
        Title: variables.Title ?? '',
      });
    }

    const result = await updateAssessmentGraphQL({
      variables: { object: variables },
    });
    if (!result.data) {
      throw new Error('Failed to update assessment');
    }

    return result.data;
  };

  // Return appropriate state based on feature flag
  if (trpcEnabled) {
    return {
      updateAssessment,
      loading: trpcMutation.loading,
      error: trpcMutation.error,
    };
  }

  return {
    updateAssessment,
    loading: graphqlState.loading,
    error: graphqlState.error,
  };
};
