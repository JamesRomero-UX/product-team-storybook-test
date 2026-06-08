import type { VariablesOf } from '@graphql-typed-document-node/core';

import type { RelationFileInsertInput } from '../generated/graphql';
import {
  DeleteRelationFileDocument,
  GetAllRelationFilesDocument,
  InsertRelationFilesDocument,
} from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const getRelationFiles = async (options?: TestQueryOptions) => {
  const { data } = await getTestClient().query({
    context: getContext(options),
    query: GetAllRelationFilesDocument,
  });

  return data.relation_file;
};

export const insertRelationFile = async (
  relationFile: RelationFileInsertInput,
  options?: TestQueryOptions
) =>
  insertRelationFiles(
    {
      objects: [relationFile],
    },
    options
  );

export const insertRelationFiles = async (
  variables: VariablesOf<typeof InsertRelationFilesDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertRelationFilesDocument,
  });
export const deleteRelationFiles = async (
  variables: VariablesOf<typeof DeleteRelationFileDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: DeleteRelationFileDocument,
  });
