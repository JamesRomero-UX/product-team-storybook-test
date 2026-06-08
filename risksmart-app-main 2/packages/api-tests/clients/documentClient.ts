import type { VariablesOf } from '@graphql-typed-document-node/core';

import type { DocumentInsertInput } from '../generated/graphql';
import {
  GetAllDocumentsDocument,
  InsertDocumentDocument,
} from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const insertDocuments = async (
  variables: VariablesOf<typeof InsertDocumentDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertDocumentDocument,
  });

export const insertDocument = async (
  document: DocumentInsertInput,
  options?: TestQueryOptions
) => insertDocuments({ objects: [document] }, options);

export const getAllDocuments = async (options?: TestQueryOptions) => {
  const { data } = await getTestClient().query({
    context: getContext(options),
    query: GetAllDocumentsDocument,
  });

  return data.document;
};
