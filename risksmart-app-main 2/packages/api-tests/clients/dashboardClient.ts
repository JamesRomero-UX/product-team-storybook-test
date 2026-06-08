import type { VariablesOf } from '@graphql-typed-document-node/core';

import type { DashboardInsertInput } from '../generated/graphql';
import {
  DeleteDashboardDocument,
  GetDashboardsDocument,
  InsertChildDashboardDocument,
  InsertDashboardsDocument,
  UpdateChildDashboardDocument,
  UpdateDashboardDocument,
} from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const getDashboards = async (options?: TestQueryOptions) => {
  const { data } = await getTestClient().query({
    context: getContext(options),
    query: GetDashboardsDocument,
  });

  return data.dashboard;
};

export const updateChildDashboard = async (
  variables: VariablesOf<typeof UpdateChildDashboardDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: UpdateChildDashboardDocument,
  });

export const insertChildDashboard = async (
  variables: VariablesOf<typeof InsertChildDashboardDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertChildDashboardDocument,
  });

export const insertDashboard = (
  dashboard: DashboardInsertInput,
  options?: TestQueryOptions
) => insertDashboards({ objects: [dashboard] }, options);

export const insertDashboards = async (
  variables: VariablesOf<typeof InsertDashboardsDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertDashboardsDocument,
  });

export const deleteDashboard = async (
  variables: VariablesOf<typeof DeleteDashboardDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: DeleteDashboardDocument,
  });

export const updateDashboard = async (
  variables: VariablesOf<typeof UpdateDashboardDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: UpdateDashboardDocument,
  });
