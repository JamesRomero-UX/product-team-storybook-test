import type { VariablesOf } from '@graphql-typed-document-node/core';

import type { IssueAssessmentInsertInput } from '../generated/graphql';
import {
  DeleteIssueAssessmentDocument,
  GetIssueAssessmentsDocument,
  InsertChildIssueAssessmentDocument,
  InsertIssueAssessmentDocument,
  UpdateChildIssueAssessmentDocument,
  UpdateIssueAssessmentDocument,
} from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const insertIssueAssessments = async (
  variables: VariablesOf<typeof InsertIssueAssessmentDocument>,
  options?: TestQueryOptions
) =>
  await getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertIssueAssessmentDocument,
  });

export const insertIssueAssessment = async (
  issueAssessment: IssueAssessmentInsertInput,
  options?: TestQueryOptions
) => {
  return await insertIssueAssessments(
    {
      objects: [issueAssessment],
    },
    options
  );
};

export const getIssueAssessments = async (options?: TestQueryOptions) =>
  (
    await getTestClient().query({
      context: getContext(options),
      query: GetIssueAssessmentsDocument,
    })
  ).data.issue_assessment;

export const deleteIssueAssessment = async (
  variables: VariablesOf<typeof DeleteIssueAssessmentDocument>,
  options?: TestQueryOptions
) =>
  await getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: DeleteIssueAssessmentDocument,
  });

export const updateIssueAssessment = async (
  variables: VariablesOf<typeof UpdateIssueAssessmentDocument>,
  options?: TestQueryOptions
) =>
  await getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: UpdateIssueAssessmentDocument,
  });

export const updateChildIssueAssessment = async (
  variables: VariablesOf<typeof UpdateChildIssueAssessmentDocument>,
  options?: TestQueryOptions
) =>
  await getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: UpdateChildIssueAssessmentDocument,
  });

export const insertChildIssueAssessment = async (
  variables: VariablesOf<typeof InsertChildIssueAssessmentDocument>,
  options?: TestQueryOptions
) =>
  await getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertChildIssueAssessmentDocument,
  });
