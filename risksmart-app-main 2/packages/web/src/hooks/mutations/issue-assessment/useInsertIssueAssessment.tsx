import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type {
  InsertIssueAssessmentMutation,
  InsertIssueAssessmentMutationVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  InsertIssueAssessmentDocument,
  namedOperations,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import type { InsertIssueAssessmentTRPCInput } from './useInsertIssueAssessmentTRPC';
import { useInsertIssueAssessmentTRPC } from './useInsertIssueAssessmentTRPC';

export const useInsertIssueAssessment = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  // GraphQL mutation (legacy)
  const [insertIssueAssessmentGraphQL, graphqlState] = useMutation(
    InsertIssueAssessmentDocument,
    {
      update: (cache) => {
        evictField(cache, 'issue');
        evictField(cache, 'tag_type');
        evictField(cache, 'issue_assessment');
        evictField(cache, 'issue_parent');
        evictField(cache, 'control');
        evictField(cache, 'issue_assessment_aggregate');
        evictField(cache, 'issue_assessment_audit');
      },
      refetchQueries: [namedOperations.Query.getIssueById],
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
  const trpcMutation = useInsertIssueAssessmentTRPC();

  const insertIssueAssessment = async (
    variables: InsertIssueAssessmentMutationVariables
  ): Promise<InsertIssueAssessmentMutation> => {
    if (trpcEnabled) {
      // Coerce array union types (string | string[]) to string[] for tRPC
      const trpcInput: InsertIssueAssessmentTRPCInput = {
        ...variables,
        TagTypeIds: Array.isArray(variables.TagTypeIds)
          ? variables.TagTypeIds
          : [variables.TagTypeIds],
        DepartmentTypeIds: Array.isArray(variables.DepartmentTypeIds)
          ? variables.DepartmentTypeIds
          : [variables.DepartmentTypeIds],
        RegulationsBreachedIds: Array.isArray(variables.RegulationsBreachedIds)
          ? variables.RegulationsBreachedIds
          : [variables.RegulationsBreachedIds],
        AssociatedControlIds: Array.isArray(variables.AssociatedControlIds)
          ? variables.AssociatedControlIds
          : [variables.AssociatedControlIds],
        PoliciesBreachedIds: Array.isArray(variables.PoliciesBreachedIds)
          ? variables.PoliciesBreachedIds
          : [variables.PoliciesBreachedIds],
      };

      return trpcMutation.insertIssueAssessment(trpcInput);
    }

    const result = await insertIssueAssessmentGraphQL({ variables });
    if (!result.data) {
      throw new Error('Failed to insert issue assessment');
    }

    return result.data;
  };

  // Return appropriate state based on feature flag
  if (trpcEnabled) {
    return {
      insertIssueAssessment,
      loading: trpcMutation.loading,
      error: trpcMutation.error,
    };
  }

  return {
    insertIssueAssessment,
    loading: graphqlState.loading,
    error: graphqlState.error,
  };
};
