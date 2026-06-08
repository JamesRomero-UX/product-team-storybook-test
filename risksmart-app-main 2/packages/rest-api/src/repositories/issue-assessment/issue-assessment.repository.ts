import type { VariablesOf } from '@graphql-typed-document-node/core';

import type {
  IssueAssessmentBoolExp,
  IssueAssessmentOrderBy,
} from '../../../generated/graphql';
import {
  DeleteIssueAssessmentsDocument,
  GetIssueAssessmentsDocument,
  InsertIssueAssessmentsDocument,
  UpdateIssueAssessmentDocument,
} from '../../../generated/graphql';
import { getHasuraBackendClient } from '../../backendGraphqlClient';
import type { FindOptions, Repository, RepositoryOptions } from '../types';

export type Where = IssueAssessmentBoolExp;
export type OrderBy = IssueAssessmentOrderBy;
export type CreateInput = VariablesOf<
  typeof InsertIssueAssessmentsDocument
>['objects'];
export type UpdateInput = VariablesOf<typeof UpdateIssueAssessmentDocument>;

export const IssueAssessmentRepository = (opts: RepositoryOptions) => {
  const client = getHasuraBackendClient(
    opts.tenant,
    opts.orgKey,
    opts.userId,
    opts.userRole
  );

  return {
    async findWhere(where: Where, options?: FindOptions<OrderBy>) {
      const { data, errors } = await client.query({
        query: GetIssueAssessmentsDocument,
        variables: { where, ...options },
      });
      if (errors) {
        throw errors[0];
      }

      return data.issue_assessment;
    },

    async create(objects: CreateInput) {
      const { data, errors } = await client.mutate({
        mutation: InsertIssueAssessmentsDocument,
        variables: { objects: objects },
      });
      if (!data?.insert_issue_assessment || errors) {
        throw new Error(JSON.stringify(errors));
      }

      return data.insert_issue_assessment.returning;
    },

    async update(payload: UpdateInput) {
      const { data, errors } = await client.mutate({
        mutation: UpdateIssueAssessmentDocument,
        variables: payload,
      });
      if (!data?.update_issue_assessment || errors) {
        throw new Error(JSON.stringify(errors));
      }

      return data.update_issue_assessment.affected_rows;
    },

    async delete(id: string | string[]) {
      await client.mutate({
        mutation: DeleteIssueAssessmentsDocument,
        variables: { Ids: Array.isArray(id) ? id : [id] },
      });
    },
  } satisfies Repository;
};
