import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type {
  Assessment_Status_Enum,
  InsertAssessmentMutation,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTRPC } from 'src/utils/trpc';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

/**
 * tRPC input type derived from GraphQL InsertAssessmentInput.
 * Title is required by the tRPC router (min 1 char), but optional in GraphQL.
 * Relationship arrays are required in GraphQL but optional in tRPC.
 */
type InsertAssessmentTRPCInput = {
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
function mapTrpcResponseToGraphQL(trpcData: {
  Id: string;
}): InsertAssessmentMutation {
  return {
    insertAssessmentApi: {
      __typename: 'IdOutput',
      Id: trpcData.Id,
    },
  };
}

export const useInsertAssessmentTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.assessment.insert.mutationOptions({
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
    insertAssessment: async (
      variables: InsertAssessmentTRPCInput
    ): Promise<InsertAssessmentMutation> => {
      const result = await mutation.mutateAsync(variables);

      return mapTrpcResponseToGraphQL(result);
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
