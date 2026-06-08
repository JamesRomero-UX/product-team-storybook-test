import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type {
  InsertRiskAssessmentResultsMutation,
  InsertRiskAssessmentResultsMutationVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { InsertRiskAssessmentResultsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import { useInsertRiskAssessmentResultTRPC } from './useInsertRiskAssessmentResultTRPC';

export const useInsertRiskAssessmentResult = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  // GraphQL mutation
  const [insertRiskAssessmentResultGraphQL, graphqlState] = useMutation(
    InsertRiskAssessmentResultsDocument,
    {
      update: (cache) => {
        evictField(cache, 'risk_assessment_result');
        evictField(cache, 'assessment');
        evictField(cache, 'risk_assessment_result_aggregate');
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
  const trpcMutation = useInsertRiskAssessmentResultTRPC();

  const insertRiskAssessmentResult = async (
    variables: InsertRiskAssessmentResultsMutationVariables
  ): Promise<InsertRiskAssessmentResultsMutation> => {
    if (trpcEnabled) {
      return trpcMutation.insertRiskAssessmentResult(variables);
    }

    const result = await insertRiskAssessmentResultGraphQL({
      variables,
    });
    if (!result.data) {
      throw new Error('Failed to insert risk assessment result');
    }

    return result.data;
  };

  // Return appropriate state based on feature flag
  if (trpcEnabled) {
    return {
      insertRiskAssessmentResult,
      loading: trpcMutation.loading,
      error: trpcMutation.error,
    };
  }

  return {
    insertRiskAssessmentResult,
    loading: graphqlState.loading,
    error: graphqlState.error,
  };
};
