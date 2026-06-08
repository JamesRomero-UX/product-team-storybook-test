import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { IssueTypes } from '@risksmart-app/trpc/src/services/service.types';
import type {
  InsertChildIssueMutation,
  InsertIssueInput,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  InsertChildIssueDocument,
  namedOperations,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import { useInsertChildIssueTRPC } from './useInsertChildIssueTRPC';

export const useInsertChildIssue = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  // GraphQL mutation
  const [insertChildIssueGraphQL, graphqlState] = useMutation(
    InsertChildIssueDocument,
    {
      update: (cache) => {
        evictField(cache, 'issue');
        evictField(cache, 'issue_aggregate');
        evictField(cache, 'internal_audit_entity');
        evictField(cache, 'internal_audit_report');
        evictField(cache, 'compliance_monitoring_assessment');
        evictField(cache, 'assessment_by_pk');
      },
      refetchQueries: [
        namedOperations.Query.getIssueById,
        namedOperations.Query.getIssues,
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
  const trpcMutation = useInsertChildIssueTRPC();

  const insertChildIssue = async (
    variables: InsertIssueInput
  ): Promise<InsertChildIssueMutation> => {
    if (trpcEnabled) {
      return trpcMutation.insertChildIssue({
        ...variables,
        Type: variables.Type as IssueTypes,
      });
    }

    const result = await insertChildIssueGraphQL({
      variables: { object: variables },
    });
    if (!result.data) {
      throw new Error('Failed to insert issue');
    }

    return result.data;
  };

  // Return appropriate state based on feature flag
  if (trpcEnabled) {
    return {
      insertChildIssue,
      loading: trpcMutation.loading,
      error: trpcMutation.error,
    };
  }

  return {
    insertChildIssue,
    loading: graphqlState.loading,
    error: graphqlState.error,
  };
};
