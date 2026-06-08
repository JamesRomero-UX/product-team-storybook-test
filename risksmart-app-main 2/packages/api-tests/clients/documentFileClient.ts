import type { VariablesOf } from '@graphql-typed-document-node/core';

import {
  DeleteDocumentFileDocument,
  GetDocumentFileByIdDocument,
  GetDocumentFilesDocument,
  InsertDocumentVersionDocument,
  UpdateDocumentFileDocument,
  UpdateDocumentVersionDocument,
} from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const getDocumentFiles = async (options?: TestQueryOptions) =>
  (
    await getTestClient().query({
      context: getContext(options),
      query: GetDocumentFilesDocument,
    })
  ).data.document_file;

export const deleteDocumentFile = async (
  variables: VariablesOf<typeof DeleteDocumentFileDocument>,
  options?: TestQueryOptions
) =>
  await getTestClient().mutate({
    context: getContext(options),
    variables,
    mutation: DeleteDocumentFileDocument,
  });

export const updateDocumentFile = async (
  variables: VariablesOf<typeof UpdateDocumentFileDocument>,
  options?: TestQueryOptions
) =>
  await getTestClient().mutate({
    context: getContext(options),
    variables,
    mutation: UpdateDocumentFileDocument,
  });

export const updateDocumentVersion = async (
  variables: VariablesOf<typeof UpdateDocumentVersionDocument>,
  options?: TestQueryOptions
) =>
  await getTestClient().mutate({
    context: getContext(options),
    variables,
    mutation: UpdateDocumentVersionDocument,
  });

export const insertDocumentVersion = async (
  variables: VariablesOf<typeof InsertDocumentVersionDocument>,
  options?: TestQueryOptions
) =>
  await getTestClient().mutate({
    context: getContext(options),
    variables,
    mutation: InsertDocumentVersionDocument,
  });

export const getDocumentFileById = async (
  variables: VariablesOf<typeof GetDocumentFileByIdDocument>,
  options?: TestQueryOptions
) => {
  return (
    await getTestClient().query({
      context: getContext(options),
      query: GetDocumentFileByIdDocument,
      variables,
    })
  ).data.document_file_by_pk;
};
