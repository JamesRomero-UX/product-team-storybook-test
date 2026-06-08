import { hasLengthAtLeast } from '@risksmart-app/shared/typeGuards';
import { DataImportStatusEnum } from 'generated/graphql';
import { BadRequest, NotFound } from 'http-errors';
import { singleLambdaBackendHandler } from 'src/backendActionApiHandler';
import { getLogger } from 'src/logger';
import { DataImportRepository } from 'src/repositories/data-import/dataImport.repository';
import { getSessionData } from 'src/session';
import { z } from 'zod';

const schema = z.object({
  Id: z.string().uuid(),
});

const logger = getLogger();

export const handler = singleLambdaBackendHandler(schema, async (request) => {
  const dataImportId = request.input.Id;
  logger.appendKeys({ dataImportId });
  const dataImportRepository = DataImportRepository(
    getSessionData(request.session_variables)
  );

  const dataImports = await dataImportRepository.findWhere({
    Id: { _eq: dataImportId },
  });
  if (!hasLengthAtLeast(dataImports, 1)) {
    throw new NotFound('Data import not found');
  }
  if (dataImports[0].Status !== DataImportStatusEnum.Valid) {
    throw new BadRequest('Data import must be valid before starting import');
  }

  const updatedRows = await dataImportRepository.setImportStatus({
    dataImportId,
    status: DataImportStatusEnum.InitiatingImport,
  });

  if (updatedRows !== 1) {
    throw new Error('Failed to start import');
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Success' }),
  };
});
