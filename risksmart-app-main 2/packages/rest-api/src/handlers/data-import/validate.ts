import { createNodeLookup } from '@risksmart-app/data-import/src/services/nodeService';
import { createSchemaLookup } from '@risksmart-app/data-import/src/services/schemaService';
import { processStreamsForInsert } from '@risksmart-app/data-import/src/validation';
import { hasLengthAtLeast } from '@risksmart-app/shared/typeGuards';
import { DataImportStatusEnum } from 'generated/graphql';
import { BadRequest } from 'http-errors';
import { getHasuraAdminClient } from 'src/adminGraphqlClient';
import { singleLambdaBackendHandler } from 'src/backendActionApiHandler';
import { DataImportRepository } from 'src/repositories/data-import/dataImport.repository';
import { FormConfigurationRepository } from 'src/repositories/form-configuration/formConfiguration.repository';
import { ObjectRepository } from 'src/repositories/objects/object.repository';
import { getStreams } from 'src/services/data-import/dataImportService';
import { getSessionData } from 'src/session';
import { z } from 'zod';

import { getLogger } from '../../logger';

const schema = z.object({
  Id: z.string().uuid(),
});
const logger = getLogger();

export const handler = singleLambdaBackendHandler(schema, async (request) => {
  const sessionData = getSessionData(request.session_variables);
  const adminClient = getHasuraAdminClient(sessionData.tenant);
  const dataImportRepository = DataImportRepository(sessionData);
  const objectRepository = ObjectRepository(sessionData);

  const dataImports = await dataImportRepository.findWhere({
    Id: {
      _eq: request.input.Id,
    },
  });
  if (!hasLengthAtLeast(dataImports, 1)) {
    throw new BadRequest('Data import not found');
  }

  const dataImport = dataImports[0];

  logger.info(`${dataImport.files.length} files found`);
  if (dataImport.files.length === 0) {
    throw new BadRequest('No data import files found');
  }

  await dataImportRepository.setToValidating({
    dataImportId: dataImport.Id,
  });

  const formConfigurationRepository = FormConfigurationRepository(sessionData);
  const { form_configuration } = await formConfigurationRepository.findWhere(
    {}
  );

  const schemaLookup = await createSchemaLookup(form_configuration);

  const objects = await objectRepository.getAllObjectIds();
  const nodeLookup = await createNodeLookup(objects);

  const streams = await getStreams(sessionData.orgKey, dataImport);

  const result = await processStreamsForInsert(
    streams,
    sessionData.orgKey,
    schemaLookup,
    nodeLookup,
    // pnpm dependency resolution issue
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adminClient as any
  );
  const errors = result.errors.map((e) => ({
    RowNumber: e.row,
    ImportObject: e.file,
    DataImportId: request.input.Id,
    Message: e.message,
  }));
  if (errors.length > 0) {
    await dataImportRepository.setToFailed({
      errors,
      dataImportId: request.input.Id,
    });
  } else {
    await dataImportRepository.setImportStatus({
      dataImportId: request.input.Id,
      status: DataImportStatusEnum.Valid,
    });
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Success' }),
  };
});
