import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { DeleteAssessmentsMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTRPC } from 'src/utils/trpc';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

const mapTrpcResponseToGraphQL = (): DeleteAssessmentsMutation => {
  return {
    delete_assessment: {
      __typename: 'assessment_mutation_response',
      // trpc should throw an error if no rows are affected
      affected_rows: 1,
    },
  };
};

export const useDeleteAssessmentTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.assessment.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.assessment.register.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.assessment.getById.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.assessment.activityRegister.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.assessment.resultsRegister.queryKey(),
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
    deleteAssessment: async (
      id: string
    ): Promise<DeleteAssessmentsMutation> => {
      await mutation.mutateAsync({ id });

      return mapTrpcResponseToGraphQL();
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
