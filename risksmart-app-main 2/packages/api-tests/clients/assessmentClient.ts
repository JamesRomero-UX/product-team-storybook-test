import type { VariablesOf } from '@graphql-typed-document-node/core';

import type { AssessmentInsertInput } from '../generated/graphql';
import {
  DeleteAssessmentDocument,
  InsertAssessmentDocument,
} from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const deleteAssessment = async (
  variables: VariablesOf<typeof DeleteAssessmentDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: DeleteAssessmentDocument,
  });

export const insertAssessments = async (
  variables: VariablesOf<typeof InsertAssessmentDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertAssessmentDocument,
  });

export const insertAssessment = async (
  assessment: AssessmentInsertInput,
  options?: TestQueryOptions
) =>
  insertAssessments(
    {
      objects: [assessment],
    },
    options
  );
