import type { VariablesOf } from '@graphql-typed-document-node/core';

import type { CommentInsertInput } from '../generated/graphql';
import {
  DeleteCommentDocument,
  GetCommentsDocument,
  InsertCommentDocument,
  UpdateCommentDocument,
} from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const deleteComment = async (id: string, options?: TestQueryOptions) =>
  await getTestClient().mutate({
    variables: {
      Id: id,
    },
    context: getContext(options),
    mutation: DeleteCommentDocument,
  });

export const updateComment = async (
  variables: VariablesOf<typeof UpdateCommentDocument>,
  options?: TestQueryOptions
) =>
  await getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: UpdateCommentDocument,
  });

export const insertComments = async (
  variables: VariablesOf<typeof InsertCommentDocument>,
  options?: TestQueryOptions
) =>
  await getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertCommentDocument,
  });

export const insertComment = async (
  comment: CommentInsertInput,
  options?: TestQueryOptions
) => await insertComments({ objects: [comment] }, options);

export const getComments = async (options?: TestQueryOptions) =>
  (
    await getTestClient().query({
      context: getContext(options),
      query: GetCommentsDocument,
    })
  ).data.comment;
