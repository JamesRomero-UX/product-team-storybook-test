import type { VariablesOf } from '@graphql-typed-document-node/core';

import type { BusinessAreaInsertInput } from '../generated/graphql';
import {
  DeleteBusinessAreaDocument,
  GetAllBusinessAreasDocument,
  InsertBusinessAreasDocument,
  UpdateBusinessAreaDocument,
} from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const deleteBusinessArea = async (
  variables: VariablesOf<typeof DeleteBusinessAreaDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: DeleteBusinessAreaDocument,
  });

export const updateBusinessArea = async (
  variables: VariablesOf<typeof UpdateBusinessAreaDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: UpdateBusinessAreaDocument,
  });

export const insertBusinessAreas = async (
  variables: VariablesOf<typeof InsertBusinessAreasDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertBusinessAreasDocument,
  });

export const insertBusinessArea = async (
  businessArea: BusinessAreaInsertInput,
  options?: TestQueryOptions
) =>
  insertBusinessAreas(
    {
      objects: [businessArea],
    },
    options
  );

export const getBusinessAreas = async (options?: TestQueryOptions) =>
  await getTestClient().query({
    context: getContext(options),
    query: GetAllBusinessAreasDocument,
  });
