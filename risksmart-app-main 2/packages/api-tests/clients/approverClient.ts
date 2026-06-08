import type { VariablesOf } from '@graphql-typed-document-node/core';

import type { ApprovalInsertInput } from '../generated/graphql';
import {
  DeleteApproverDocument,
  GetApproversDocument,
  InsertApproversDocument,
  UpdateApproverDocument,
} from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const getApprovers = async (options?: TestQueryOptions) => {
  const { data } = await getTestClient().query({
    context: getContext(options),
    query: GetApproversDocument,
  });

  return data.approver;
};

export const insertApprover = (
  approval: ApprovalInsertInput,
  options?: TestQueryOptions
) => insertApprovers({ objects: [approval] }, options);

export const insertApprovers = async (
  variables: VariablesOf<typeof InsertApproversDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertApproversDocument,
  });

export const deleteApprover = async (
  variables: VariablesOf<typeof DeleteApproverDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: DeleteApproverDocument,
  });

export const updateApprover = async (
  variables: VariablesOf<typeof UpdateApproverDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: UpdateApproverDocument,
  });
