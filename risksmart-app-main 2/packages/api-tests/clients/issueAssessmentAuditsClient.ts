import { GetIssueAssessmentAuditsDocument } from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const getIssueAssessmentAudits = async (options?: TestQueryOptions) => {
  const { data, errors } = await getTestClient().query({
    context: getContext(options),
    query: GetIssueAssessmentAuditsDocument,
  });
  if (errors?.length) {
    console.error(errors);
    throw new Error('Failed to retrieve data');
  }

  return data.issue_assessment_audit;
};
