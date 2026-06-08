import type { VariablesOf } from '@graphql-typed-document-node/core';

import type { ApprovalInsertInput } from '../generated/graphql';
import {
  DeleteApprovalDocument,
  GetApprovalsDocument,
  InsertApprovalsDocument,
} from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const getApprovals = async (options?: TestQueryOptions) => {
  const { data } = await getTestClient().query({
    context: getContext(options),
    query: GetApprovalsDocument,
  });

  return data.approval;
};

export const insertApproval = (
  approval: ApprovalInsertInput,
  options?: TestQueryOptions
) => insertApprovals({ objects: [approval] }, options);

export const insertApprovals = async (
  variables: VariablesOf<typeof InsertApprovalsDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertApprovalsDocument,
  });

export const deleteApproval = async (
  variables: VariablesOf<typeof DeleteApprovalDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: DeleteApprovalDocument,
  });
