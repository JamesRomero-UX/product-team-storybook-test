import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type {
  InsertAssessmentInput,
  InsertAssessmentMutation,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  InsertAssessmentDocument,
  namedOperations,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import { useInsertAssessmentTRPC } from './useInsertAssessmentTRPC';

export const useInsertAssessment = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  // GraphQL mutation
  const [insertAssessmentGraphQL, graphqlState] = useMutation(
    InsertAssessmentDocument,
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
  const trpcMutation = useInsertAssessmentTRPC();

  const insertAssessment = async (
    variables: InsertAssessmentInput
  ): Promise<InsertAssessmentMutation> => {
    if (trpcEnabled) {
      return trpcMutation.insertAssessment({
        ...variables,
        Title: variables.Title ?? '',
      });
    }

    const result = await insertAssessmentGraphQL({
      variables: { object: variables },
    });
    if (!result.data) {
      throw new Error('Failed to insert assessment');
    }

    return result.data;
  };

  // Return appropriate state based on feature flag
  if (trpcEnabled) {
    return {
      insertAssessment,
      loading: trpcMutation.loading,
      error: trpcMutation.error,
    };
  }

  return {
    insertAssessment,
    loading: graphqlState.loading,
    error: graphqlState.error,
  };
};
