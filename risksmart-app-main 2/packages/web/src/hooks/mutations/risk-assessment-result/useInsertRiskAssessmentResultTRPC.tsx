import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { RiskAssessmentResultControlType } from '@risksmart-app/domain/src/types/consts/risk-assessment-result-control-type';
import type { InsertRiskAssessmentResultsMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTRPC } from 'src/utils/trpc';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

type InsertRiskAssessmentResultInput = {
  RiskIds: string | string[];
  ControlType?: RiskAssessmentResultControlType | null;
  Rating?: number | null;
  Likelihood?: number | null;
  Impact?: number | null;
  AssessmentId?: string | null;
  CustomAttributeData?: Record<string, unknown> | null;
  TestDate?: string | null;
  Rationale?: string | null;
};

/**
 * Maps TRPC mutation response to match the GraphQL mutation structure
 */
function mapTrpcResponseToGraphQL(trpcData: {
  Ids: string[];
}): InsertRiskAssessmentResultsMutation {
  return {
    insertChildRiskAssessmentResult: {
      __typename: 'InsertChildRiskAssessmentResultOutput',
      Ids: trpcData.Ids,
    },
  };
}

export const useInsertRiskAssessmentResultTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.riskAssessmentResult.insert.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.assessment.register.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.assessment.resultsRegister.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey:
            trpc.frontend.assessment.riskAssessmentResultsByRiskId.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.risk.register.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.risk.scores.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.risk.riskScoresByRiskId.queryKey(),
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
    insertRiskAssessmentResult: async (
      variables: InsertRiskAssessmentResultInput
    ): Promise<InsertRiskAssessmentResultsMutation> => {
      const riskIds = Array.isArray(variables.RiskIds)
        ? variables.RiskIds
        : [variables.RiskIds];
      if (!variables.ControlType) {
        throw new Error('ControlType is required');
      }
      const result = await mutation.mutateAsync({
        ...variables,
        RiskIds: riskIds,
        ControlType: variables.ControlType,
      });

      return mapTrpcResponseToGraphQL(result);
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
