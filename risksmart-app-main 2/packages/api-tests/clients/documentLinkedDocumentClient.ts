import type { VariablesOf } from '@graphql-typed-document-node/core';

import type { DocumentLinkedDocumentInsertInput } from '../generated/graphql';
import {
  DeleteDocumentLinkedDocumentDocument,
  GetDocumentLinkedDocumentDocument,
  InsertDocumentLinkedDocumentsDocument,
} from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const getDocumentLinkedDocument = async (options?: TestQueryOptions) => {
  const { data } = await getTestClient().query({
    context: getContext(options),
    query: GetDocumentLinkedDocumentDocument,
  });

  return data.document_linked_document;
};

export const deleteDocumentLinkedDocument = async (
  variables: VariablesOf<typeof DeleteDocumentLinkedDocumentDocument>,
  options?: TestQueryOptions
) => {
  const result = await getTestClient().mutate({
    context: getContext(options),
    variables,
    mutation: DeleteDocumentLinkedDocumentDocument,
  });

  return result.data?.delete_document_linked_document;
};

export const insertDocumentLinkedDocuments = async (
  variables: VariablesOf<typeof InsertDocumentLinkedDocumentsDocument>,
  options?: TestQueryOptions
) => {
  const result = await getTestClient().mutate({
    context: getContext(options),
    variables,
    mutation: InsertDocumentLinkedDocumentsDocument,
  });

  return result.data?.insert_document_linked_document;
};

export const insertDocumentLinkedDocument = (
  documentLinkedDocument: DocumentLinkedDocumentInsertInput,
  options?: TestQueryOptions
) =>
  insertDocumentLinkedDocuments(
    {
      linkedDocuments: [documentLinkedDocument],
    },
    options
  );
