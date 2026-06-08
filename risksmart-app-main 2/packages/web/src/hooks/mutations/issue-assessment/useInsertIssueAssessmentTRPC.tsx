import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { IssueAssessmentStatus } from '@risksmart-app/domain/src/types/consts/issue-assessment-status';
import type { InsertIssueAssessmentMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTRPC } from 'src/utils/trpc';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

export type InsertIssueAssessmentTRPCInput = {
  ParentIssueId: string;
  Severity?: number | null;
  Status?: IssueAssessmentStatus | null;
  CertifiedIndividual?: string | null;
  IssueType?: string | null;
  ActualCloseDate?: string | null;
  TargetCloseDate?: string | null;
  PolicyOwnerCommentary?: string | null;
  PolicyOwner?: string | null;
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  PolicyBreach?: boolean | null;
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  Reportable?: boolean | null;
  PoliciesBreached?: string | null;
  Rationale?: string | null;
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  IssueCausedByThirdParty?: boolean | null;
  SystemResponsible?: string | null;
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  RegulatoryBreach?: boolean | null;
  RegulationsBreached?: string | null;
  ThirdPartyResponsible?: string | null;
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  IssueCausedBySystemIssue?: boolean | null;
  CustomAttributeData?: Record<string, unknown> | null;
  TagTypeIds: string[];
  DepartmentTypeIds: string[];
  RegulationsBreachedIds: string[];
  AssociatedControlIds: string[];
  PoliciesBreachedIds: string[];
};

/**
 * Maps TRPC mutation response to match the GraphQL mutation structure
 */
function mapTrpcResponseToGraphQL(trpcData: {
  Id: string;
}): InsertIssueAssessmentMutation {
  return {
    insertChildIssueAssessment: {
      __typename: 'IdOutput',
      Id: trpcData.Id,
    },
  };
}

export const useInsertIssueAssessmentTRPC = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.issueAssessment.insert.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.issue.issueAssessmentByParentId.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.issue.issueById.queryKey(),
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
    insertIssueAssessment: async (
      variables: InsertIssueAssessmentTRPCInput
    ): Promise<InsertIssueAssessmentMutation> => {
      const result = await mutation.mutateAsync(variables);

      return mapTrpcResponseToGraphQL(result);
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
