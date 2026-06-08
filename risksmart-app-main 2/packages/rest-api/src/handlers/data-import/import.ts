import { insertAll } from '@risksmart-app/data-import/src/graphqlClient';
import { createNodeLookup } from '@risksmart-app/data-import/src/services/nodeService';
import { createSchemaLookup } from '@risksmart-app/data-import/src/services/schemaService';
import { processStreamsForInsert } from '@risksmart-app/data-import/src/validation';
import { hasLengthAtLeast } from '@risksmart-app/shared/typeGuards';
import type { DataImport } from 'generated/graphql';
import { DataImportStatusEnum } from 'generated/graphql';
import { getHasuraBackendClient } from 'src/backendGraphqlClient';
import { singleEventBridgeHandler } from 'src/eventBridgeHandler';
import { DataImportRepository } from 'src/repositories/data-import/dataImport.repository';
import { FormConfigurationRepository } from 'src/repositories/form-configuration/formConfiguration.repository';
import { ObjectRepository } from 'src/repositories/objects/object.repository';
import { SYSTEM_ADMIN_ROLE } from 'src/repositories/types';
import { getStreams } from 'src/services/data-import/dataImportService';
import { getSessionData } from 'src/session';

import { getLogger } from '../../logger';
import type { DataChangeEvent } from '../events/DataChangeEvent';

const logger = getLogger();

export const handler = singleEventBridgeHandler<
  string,
  DataChangeEvent<DataImport, 'data_import'>,
  void
>(async ({ detail }) => {
  if (!detail.event.data.new) {
    return;
  }
  const newStatus = detail.event.data.new.Status;
  const oldStatus = detail.event.data.old?.Status;

  const startImporting =
    newStatus === DataImportStatusEnum.InitiatingImport &&
    oldStatus === DataImportStatusEnum.Valid;
  if (!startImporting) {
    logger.info('Not importing. Incorrect status transition', {
      oldStatus,
      newStatus,
    });

    return;
  }

  const dataImportId = detail.event.data.new.Id;
  logger.appendKeys({ dataImportId });
  const sessionData = getSessionData(detail.event.session_variables);
  const dataImportRepository = DataImportRepository(sessionData);
  const formConfigurationRepository = FormConfigurationRepository(sessionData);
  const objectRepository = ObjectRepository(sessionData);

  const dataImports = await dataImportRepository.findWhere({
    Id: {
      _eq: dataImportId,
    },
  });
  if (!hasLengthAtLeast(dataImports, 1)) {
    logger.error(`Data import not found`);

    return;
  }

  const dataImport = dataImports[0];
  // Need to check status on data base record incase we receive a duplicate event etc
  if (dataImport.Status !== DataImportStatusEnum.InitiatingImport) {
    logger.info(`Cannot start import with incorrect status`, {
      Status: dataImport.Status,
    });

    return;
  }

  const updatedRows = await dataImportRepository.setImportStatus({
    dataImportId,
    status: DataImportStatusEnum.Importing,
  });
  if (updatedRows === 0) {
    logger.error('Failed to update data import status');
    throw new Error('Failed to set status to importing');
  }

  const { form_configuration } = await formConfigurationRepository.findWhere(
    {}
  );

  const schemaLookup = await createSchemaLookup(form_configuration);

  const objects = await objectRepository.getAllObjectIds();
  const nodeLookup = await createNodeLookup(objects);

  const hasuraClient = getHasuraBackendClient(
    sessionData.tenant,
    sessionData.orgKey,
    sessionData.userId,
    SYSTEM_ADMIN_ROLE
  );

  const streams = await getStreams(sessionData.orgKey, dataImport);
  try {
    const result = await processStreamsForInsert(
      streams,
      sessionData.orgKey,
      schemaLookup,
      nodeLookup,
      // pnpm dependency resolution issue
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      hasuraClient as any
    );

    logger.info(
      `result: ${streams} ${sessionData.orgKey} ${Object.keys(schemaLookup).length} ${Object.keys(nodeLookup).length}`
    );

    if (result.errors.length > 0) {
      logger.info('Validation errors. Exiting');
      const errors = result.errors.map((e) => ({
        RowNumber: e.row,
        ImportObject: e.file,
        DataImportId: dataImportId,
        Message: e.message,
      }));

      const updatedRows = await dataImportRepository.setToFailed({
        errors,
        dataImportId,
      });

      if (updatedRows === 0) {
        logger.error('Failed to update data import status and store errors');
      }
    } else {
      logger.info('Starting import process');

      // pnpm dependency resolution issue
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await insertAll(result.result, hasuraClient as any);

      logger.info('Import complete');
      const updatedRows = await dataImportRepository.setImportStatus({
        dataImportId,
        status: DataImportStatusEnum.Complete,
      });
      if (updatedRows === 0) {
        logger.error('Failed to update data import status');
      }
    }
  } catch (e) {
    const error = e as Error;

    logger.error('Import failed with: ', error);

    const errors = [
      {
        RowNumber: 0,
        ImportObject: 'Unknown',
        DataImportId: dataImportId,
        Message: error.message,
      },
    ];

    const updatedRows = await dataImportRepository.setToFailed({
      errors,
      dataImportId,
    });

    if (updatedRows === 0) {
      logger.error('Failed to update data import status and store error');
    }
  }
});
