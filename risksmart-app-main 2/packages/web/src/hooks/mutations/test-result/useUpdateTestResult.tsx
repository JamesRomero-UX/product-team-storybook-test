import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { TestType } from '@risksmart-app/domain/src/types/consts/test-type';
import type {
  UpdateTestResultInput,
  UpdateTestResultMutation,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { UpdateTestResultDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

type UpdateTestResultHookInput = Omit<UpdateTestResultInput, 'TestType'> & {
  TestType?: TestType | null;
  OriginalTimestamp: string;
};

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { evictField } from '@/utils/graphqlUtils';

import { useUpdateTestResultTRPC } from './useUpdateTestResultTRPC';

export const useUpdateTestResult = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { addNotification } = useNotifications();

  // GraphQL mutation
  const [updateTestResultGraphQL, graphqlState] = useMutation(
    UpdateTestResultDocument,
    {
      update: (cache) => {
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

  // tRPC mutation
  const trpcMutation = useUpdateTestResultTRPC();

  const updateTestResult = async (
    variables: UpdateTestResultHookInput
  ): Promise<UpdateTestResultMutation> => {
    if (trpcEnabled) {
      return trpcMutation.updateTestResult(variables);
    }

    const result = await updateTestResultGraphQL({
      variables: { object: variables },
    });
    if (!result.data) {
      throw new Error('Failed to update test result');
    }

    return result.data;
  };

  // Return appropriate state based on feature flag
  if (trpcEnabled) {
    return {
      updateTestResult,
      loading: trpcMutation.loading,
      error: trpcMutation.error,
    };
  }

  return {
    updateTestResult,
    loading: graphqlState.loading,
    error: graphqlState.error,
  };
};
