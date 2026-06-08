import type { VariablesOf } from '@graphql-typed-document-node/core';

import {
  DataImportStartImportDocument,
  DeleteDataImportDocument,
  GetDataImportsDocument,
  InsertDataImportDocument,
  UpdateDataImportDocument,
} from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const deleteDataImport = async (
  id: string,
  options?: TestQueryOptions
) =>
  await getTestClient().mutate({
    variables: {
      Id: id,
    },
    context: getContext(options),
    mutation: DeleteDataImportDocument,
  });

export const updateDataImport = async (
  variables: VariablesOf<typeof UpdateDataImportDocument>,
  options?: TestQueryOptions
) =>
  await getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: UpdateDataImportDocument,
  });

export const insertDataImport = async (
  variables: VariablesOf<typeof InsertDataImportDocument>,
  options?: TestQueryOptions
) =>
  await getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertDataImportDocument,
  });

export const getDataImports = async (options?: TestQueryOptions) =>
  await getTestClient().query({
    context: getContext(options),
    query: GetDataImportsDocument,
  });

export const startDataImport = async (
  variables: VariablesOf<typeof DataImportStartImportDocument>,
  options?: TestQueryOptions
) =>
  await getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: DataImportStartImportDocument,
  });
