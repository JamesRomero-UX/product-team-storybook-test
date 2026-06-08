import {
  DeleteActionsDocument,
  type DeleteActionsMutation,
  type DeleteActionsMutationVariables,
  DeleteIndicatorResultsDocument,
  type DeleteIndicatorResultsMutation,
  type DeleteIndicatorResultsMutationVariables,
  DeleteIndicatorsDocument,
  type DeleteIndicatorsMutation,
  type DeleteIndicatorsMutationVariables,
  DeleteIssuesDocument,
  type DeleteIssuesMutation,
  type DeleteIssuesMutationVariables,
  DeleteRiskDocument,
  type DeleteRiskMutation,
  type DeleteRiskMutationVariables,
  InsertChildActionDocument,
  type InsertChildActionMutation,
  type InsertChildActionMutationVariables,
  InsertIndicatorDocument,
  type InsertIndicatorMutation,
  type InsertIndicatorMutationVariables,
  InsertIndicatorResultDocument,
  type InsertIndicatorResultMutation,
  type InsertIndicatorResultMutationVariables,
  InsertIssueAssessmentDocument,
  type InsertIssueAssessmentMutation,
  type InsertIssueAssessmentMutationVariables,
  InsertIssueDocument,
  type InsertIssueMutation,
  type InsertIssueMutationVariables,
  InsertRiskDocument,
  type InsertRiskMutation,
  type InsertRiskMutationVariables,
  UpdateActionDocument,
  type UpdateActionMutation,
  type UpdateActionMutationVariables,
  UpdateIndicatorDocument,
  type UpdateIndicatorMutation,
  type UpdateIndicatorMutationVariables,
  UpdateIndicatorResultDocument,
  type UpdateIndicatorResultMutation,
  type UpdateIndicatorResultMutationVariables,
  UpdateIssueAssessmentDocument,
  type UpdateIssueAssessmentMutation,
  type UpdateIssueAssessmentMutationVariables,
  UpdateIssueDocument,
  type UpdateIssueMutation,
  type UpdateIssueMutationVariables,
  UpdateRiskDocument,
  type UpdateRiskMutation,
  type UpdateRiskMutationVariables,
} from '../generated/graphql';
import type { GraphqlClient } from '../graphql/client';
import { createGraphqlClient } from '../graphql/client';
import {
  toGraphqlCreateActionInput,
  toGraphqlUpdateActionInput,
} from '../graphql/mutations/action-transforms';
import {
  toGraphqlCreateIndicatorResultInput,
  toGraphqlUpdateIndicatorResultInput,
} from '../graphql/mutations/indicator-result-transforms';
import {
  toGraphqlCreateIndicatorInput,
  toGraphqlUpdateIndicatorInput,
} from '../graphql/mutations/indicator-transforms';
import {
  toGraphqlCreateIssueAssessmentInput,
  toGraphqlUpdateIssueAssessmentInput,
} from '../graphql/mutations/issue-assessment-transforms';
import {
  toGraphqlCreateIssueInput,
  toGraphqlUpdateIssueInput,
} from '../graphql/mutations/issue-transforms';
import { toGraphqlRiskInput } from '../graphql/mutations/risk-transforms';
import type {
  IMutationClient,
  MutationContext,
} from './mutation-client.interface';

export interface GraphqlMutationClientConfig {
  hasuraEndpoint: string;
  hasuraAdminSecret: string;
  userId: string;
  roleName: string;
}

export const createGraphqlMutationClient = (
  config: GraphqlMutationClientConfig
): IMutationClient => {
  const client = createGraphqlClient({
    endpoint: `${config.hasuraEndpoint}`,
    defaultHeaders: {
      'x-hasura-admin-secret': config.hasuraAdminSecret,
      'x-hasura-user-id': config.userId,
      'x-hasura-role': config.roleName,
    },
  });

  return createMutationClientFromGraphql(client);
};

export const createMutationClientFromGraphql = (
  client: GraphqlClient
): IMutationClient => {
  const mutationHeadersFromContext = (ctx: MutationContext) => ({
    'x-hasura-org-id': ctx.orgId,
    'x-tenant-name': ctx.tenantId,
  });

  return {
    async deleteRisk(variables, ctx) {
      return client.mutate<DeleteRiskMutation, DeleteRiskMutationVariables>(
        DeleteRiskDocument,
        variables,
        mutationHeadersFromContext(ctx)
      );
    },
    async updateRisk(data, ctx) {
      const { id, existingOwnership, ...rest } = data;
      const input = toGraphqlRiskInput(rest, existingOwnership);

      return client.mutate<UpdateRiskMutation, UpdateRiskMutationVariables>(
        UpdateRiskDocument,
        { object: { ...input, Id: id } },
        mutationHeadersFromContext(ctx)
      );
    },
    async insertRisk(data, ctx) {
      const input = toGraphqlRiskInput(data);

      return client.mutate<InsertRiskMutation, InsertRiskMutationVariables>(
        InsertRiskDocument,
        { object: input },
        mutationHeadersFromContext(ctx)
      );
    },
    async insertIndicator(data, ctx) {
      const input = toGraphqlCreateIndicatorInput(data);

      return client.mutate<
        InsertIndicatorMutation,
        InsertIndicatorMutationVariables
      >(
        InsertIndicatorDocument,
        { object: input },
        mutationHeadersFromContext(ctx)
      );
    },
    async updateIndicator(data, ctx) {
      const { id, existingOwnership, ...rest } = data;
      const input = toGraphqlUpdateIndicatorInput(rest, existingOwnership);

      return client.mutate<
        UpdateIndicatorMutation,
        UpdateIndicatorMutationVariables
      >(
        UpdateIndicatorDocument,
        { object: { ...input, Id: id } },
        mutationHeadersFromContext(ctx)
      );
    },
    async deleteIndicator(variables, ctx) {
      return client.mutate<
        DeleteIndicatorsMutation,
        DeleteIndicatorsMutationVariables
      >(DeleteIndicatorsDocument, variables, mutationHeadersFromContext(ctx));
    },
    async insertIndicatorResult(data, ctx) {
      const { indicatorId, ...rest } = data;
      const variables = toGraphqlCreateIndicatorResultInput(rest, indicatorId);

      return client.mutate<
        InsertIndicatorResultMutation,
        InsertIndicatorResultMutationVariables
      >(
        InsertIndicatorResultDocument,
        variables,
        mutationHeadersFromContext(ctx)
      );
    },
    async updateIndicatorResult(data, ctx) {
      const { resultId, ...rest } = data;
      const variables = toGraphqlUpdateIndicatorResultInput(rest, resultId);

      return client.mutate<
        UpdateIndicatorResultMutation,
        UpdateIndicatorResultMutationVariables
      >(
        UpdateIndicatorResultDocument,
        variables,
        mutationHeadersFromContext(ctx)
      );
    },
    async deleteIndicatorResult(variables, ctx) {
      return client.mutate<
        DeleteIndicatorResultsMutation,
        DeleteIndicatorResultsMutationVariables
      >(
        DeleteIndicatorResultsDocument,
        variables,
        mutationHeadersFromContext(ctx)
      );
    },
    async insertIssue(data, ctx) {
      const input = toGraphqlCreateIssueInput(data);

      return client.mutate<InsertIssueMutation, InsertIssueMutationVariables>(
        InsertIssueDocument,
        { object: input },
        mutationHeadersFromContext(ctx)
      );
    },
    async updateIssue(data, ctx) {
      const { id, originalTimestamp, existingOwnership, ...rest } = data;
      const input = toGraphqlUpdateIssueInput(rest, existingOwnership);

      return client.mutate<UpdateIssueMutation, UpdateIssueMutationVariables>(
        UpdateIssueDocument,
        { object: { ...input, Id: id, OriginalTimestamp: originalTimestamp } },
        mutationHeadersFromContext(ctx)
      );
    },
    async deleteIssue(variables, ctx) {
      return client.mutate<DeleteIssuesMutation, DeleteIssuesMutationVariables>(
        DeleteIssuesDocument,
        { ids: variables.ids },
        mutationHeadersFromContext(ctx)
      );
    },
    async insertAction(data, ctx) {
      const variables = toGraphqlCreateActionInput(data);

      return client.mutate<
        InsertChildActionMutation,
        InsertChildActionMutationVariables
      >(InsertChildActionDocument, variables, mutationHeadersFromContext(ctx));
    },
    async updateAction(data, ctx) {
      const { id, originalTimestamp, existingOwnership, ...rest } = data;
      const input = toGraphqlUpdateActionInput(rest, existingOwnership);

      return client.mutate<UpdateActionMutation, UpdateActionMutationVariables>(
        UpdateActionDocument,
        { ...input, Id: id, OriginalTimestamp: originalTimestamp },
        mutationHeadersFromContext(ctx)
      );
    },
    async deleteActions(variables, ctx) {
      return client.mutate<
        DeleteActionsMutation,
        DeleteActionsMutationVariables
      >(DeleteActionsDocument, variables, mutationHeadersFromContext(ctx));
    },
    async insertIssueAssessment(data, ctx) {
      const { parentIssueId, ...rest } = data;
      const variables = toGraphqlCreateIssueAssessmentInput(
        rest,
        parentIssueId
      );

      return client.mutate<
        InsertIssueAssessmentMutation,
        InsertIssueAssessmentMutationVariables
      >(
        InsertIssueAssessmentDocument,
        variables,
        mutationHeadersFromContext(ctx)
      );
    },
    async updateIssueAssessment(data, ctx) {
      const { id, originalTimestamp, existingDepartmentTypeIds, ...rest } =
        data;
      const variables = toGraphqlUpdateIssueAssessmentInput(
        rest,
        id,
        originalTimestamp,
        existingDepartmentTypeIds
      );

      return client.mutate<
        UpdateIssueAssessmentMutation,
        UpdateIssueAssessmentMutationVariables
      >(
        UpdateIssueAssessmentDocument,
        variables,
        mutationHeadersFromContext(ctx)
      );
    },
  };
};
