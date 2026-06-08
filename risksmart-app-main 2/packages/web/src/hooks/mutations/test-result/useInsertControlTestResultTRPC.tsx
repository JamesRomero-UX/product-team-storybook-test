import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { TestType } from '@risksmart-app/domain/src/types/consts/test-type';
import type {
  InsertControlTestResultMutation,
  InsertControlTestResultMutationVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { useTRPC } from '@/utils/trpc';

type InsertControlTestResultTRPCInput = Omit<
  InsertControlTestResultMutationVariables,
  'ControlIds' | 'TestType'
> & {
  ControlIds: string[];
  TestType?: TestType | null;
};

/**
 * Maps TRPC mutation response to match the GraphQL mutation structure
 */
const mapTrpcResponseToGraphQL = (trpcData: {
  Ids: string[];
}): InsertControlTestResultMutation => ({
  insertControlTestResult: {
    __typename: 'insertControlTestResultOutput',
    Ids: trpcData.Ids,
  },
});

export const useInsertControlTestResultTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.testResult.insert.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.testResult.testResults.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.testResult.testResultsByControlId.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey:
            trpc.frontend.testResult.latestTestResultsByControlId.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.testResult.testResultById.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.control.controlById.queryKey(),
        });
      },
    }),
    throwOnError: true,
  });

  // Handle TRPC errors
  useEffect(() => {
    if (trpcEnabled && mutation.error) {
      addNotification({
        type: 'error',
        content: mutation.error.message,
      });
    }
  }, [mutation.error, addNotification, trpcEnabled]);

  return {
    insertControlTestResult: async (
      variables: InsertControlTestResultTRPCInput
    ): Promise<InsertControlTestResultMutation> => {
      const result = await mutation.mutateAsync(variables);

      return mapTrpcResponseToGraphQL(result);
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
