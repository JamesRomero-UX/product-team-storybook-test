import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type {
  Assessment_Status_Enum,
  UpdateAssessmentMutation,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTRPC } from 'src/utils/trpc';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

/**
 * tRPC input type for updateAssessment.
 * Assessment has no schedule, so no schedule field transformation needed.
 */
type UpdateAssessmentTRPCInput = {
  Id: string;
  Title: string;
  Status: Assessment_Status_Enum;
  OriginatingItemId?: string | null;
  Summary?: string | null;
  ActualCompletionDate?: string | null;
  NextTestDate?: string | null;
  StartDate?: string | null;
  TargetCompletionDate?: string | null;
  CompletedByUser?: string | null;
  Outcome?: number | null;
  CustomAttributeData?: Record<string, unknown> | null;
  OwnerUserIds?: string[];
  OwnerGroupIds?: string[];
  ContributorUserIds?: string[];
  ContributorGroupIds?: string[];
  TagTypeIds?: string[];
  DepartmentTypeIds?: string[];
};

/**
 * Maps TRPC mutation response to match the GraphQL mutation structure
 */
const mapTrpcResponseToGraphQL = (_trpcData: {
  Id: string;
}): UpdateAssessmentMutation => {
  return {
    updateAssessmentApi: {
      __typename: 'GenericMutationOutput',
      affected_rows: 1,
    },
  };
};

export const useUpdateAssessmentTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.assessment.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.assessment.register.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.assessment.getById.queryKey(),
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
    updateAssessment: async (
      variables: UpdateAssessmentTRPCInput
    ): Promise<UpdateAssessmentMutation> => {
      const result = await mutation.mutateAsync(variables);

      return mapTrpcResponseToGraphQL(result);
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
