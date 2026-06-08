import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import type { VariablesOf } from '@graphql-typed-document-node/core';
import type {
  InsertInternalAuditDocument,
  UpdateInternalAuditDocument,
} from 'generated/graphql';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';

import { getLogger } from '../../logger';

const logger = getLogger();

export const insertInternalAudit = async (
  hasuraClient: ApolloClient<NormalizedCacheObject>,
  variables: VariablesOf<typeof InsertInternalAuditDocument>
) => {
  logger.info('Inserting internal audit');

  const result =
    await getRisksmartApiClient(hasuraClient).insertInternalAudit(variables);

  return result?.insert_internal_audit_entity_one?.Id;
};

export const updateInternalAudit = async (
  hasuraClient: ApolloClient<NormalizedCacheObject>,
  variables: VariablesOf<typeof UpdateInternalAuditDocument>
) => {
  logger.info('Updating internal audit');
  const result =
    await getRisksmartApiClient(hasuraClient).updateInternalAudit(variables);

  return result?.update_internal_audit_entity?.affected_rows;
};

export const deleteUnusedBusinessAreas = async (
  hasuraClient: ApolloClient<NormalizedCacheObject>
) => {
  logger.info('Deleting Unused BusinessAreas');
  const result =
    await getRisksmartApiClient(hasuraClient).deleteUnusedBusinessAreas();

  return result?.delete_business_area?.affected_rows;
};
