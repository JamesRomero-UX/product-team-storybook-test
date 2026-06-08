import type { VariablesOf } from '@graphql-typed-document-node/core';

import type { InternalAuditReportInsertInput } from '../generated/graphql';
import {
  DeleteInternalAuditReportDocument,
  GetAllInternalAuditReportIdsDocument,
  GetAllInternalAuditReportsDocument,
  InsertInternalAuditReportDocument,
} from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const deleteInternalAuditReport = async (
  variables: VariablesOf<typeof DeleteInternalAuditReportDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: DeleteInternalAuditReportDocument,
  });

export const insertInternalAuditReports = async (
  variables: VariablesOf<typeof InsertInternalAuditReportDocument>,
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables,
    context: getContext(options),
    mutation: InsertInternalAuditReportDocument,
  });

export const insertInternalAuditReport = async (
  internalAuditReport: InternalAuditReportInsertInput,
  options?: TestQueryOptions
) =>
  insertInternalAuditReports(
    {
      objects: [internalAuditReport],
    },
    options
  );

export const getInternalAuditReports = async (options?: TestQueryOptions) =>
  await getTestClient().query({
    context: getContext(options),
    query: GetAllInternalAuditReportsDocument,
  });

export const getInternalAuditReportIds = async (options?: TestQueryOptions) =>
  await getTestClient().query({
    context: getContext(options),
    query: GetAllInternalAuditReportIdsDocument,
  });
