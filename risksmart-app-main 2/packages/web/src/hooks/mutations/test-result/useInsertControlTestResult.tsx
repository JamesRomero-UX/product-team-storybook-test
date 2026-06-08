import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { TestType } from '@risksmart-app/domain/src/types/consts/test-type';
import type {
  InsertControlTestResultMutation,
  InsertControlTestResultMutationVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { InsertControlTestResultDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

type InsertControlTestResultInput = Omit<
  InsertControlTestResultMutationVariables,
  'TestType'
> & {
  TestType?: TestType | null;
};

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import { useInsertControlTestResultTRPC } from './useInsertControlTestResultTRPC';

export const useInsertControlTestResult = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  // GraphQL mutation
  const [insertControlTestResultGraphQL, graphqlState] = useMutation(
    InsertControlTestResultDocument,
    {
      update: (cache) => {
        evictField(cache, 'test_result');
        evictField(cache, 'test_result_aggregate');
        evictField(cache, 'control');
        evictField(cache, 'internal_audit_report');
        evictField(cache, 'compliance_monitoring_assessment');
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

  // tRPC mutation
  const trpcMutation = useInsertControlTestResultTRPC();

  const insertControlTestResult = async (
    variables: InsertControlTestResultInput
  ): Promise<InsertControlTestResultMutation> => {
    if (trpcEnabled) {
      const { ControlIds, ...rest } = variables;

      return trpcMutation.insertControlTestResult({
        ...rest,
        ControlIds: Array.isArray(ControlIds) ? ControlIds : [ControlIds],
      });
    }

    const result = await insertControlTestResultGraphQL({
      variables,
    });
    if (!result.data) {
      throw new Error('Failed to insert control test result');
    }

    return result.data;
  };

  // Return appropriate state based on feature flag
  if (trpcEnabled) {
    return {
      insertControlTestResult,
      loading: trpcMutation.loading,
      error: trpcMutation.error,
    };
  }

  return {
    insertControlTestResult,
    loading: graphqlState.loading,
    error: graphqlState.error,
  };
};
