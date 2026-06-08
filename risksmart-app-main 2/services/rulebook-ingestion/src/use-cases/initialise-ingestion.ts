import type { IngestionRun, ProviderName, Regulator } from 'src/domain/types';
import {
  addRegulatorToIngestionRun,
  completeIngestionRun,
  createIngestionRun,
  failIngestionRun,
} from 'src/domain/types';
import { getLogger } from 'src/logger';

const logger = getLogger();

export interface Dependencies {
  saveNewIngestionRun: (
    ingestionRun: Omit<IngestionRun, 'id'>
  ) => Promise<IngestionRun>;

  updateIngestionRun: (ingestionRun: IngestionRun) => Promise<IngestionRun>;

  getRegulators: () => Promise<Regulator[]>;
}

export const createInitialiseIngestionUseCase = ({
  saveNewIngestionRun,
  updateIngestionRun,
  getRegulators,
}: Dependencies) => {
  const execute = async ({
    providerName,
    orgKey,
    tenant,
  }: {
    providerName: ProviderName;
    orgKey: string;
    tenant: string;
  }): Promise<IngestionRun> => {
    let ingestionRun = await saveNewIngestionRun(
      createIngestionRun(providerName, orgKey, tenant)
    );

    logger.info('Starting rulebooks ingestion run', {
      ingestionRunId: ingestionRun.id,
      provider: ingestionRun.providerName,
    });

    try {
      const regulators = await getRegulators();

      ingestionRun = regulators.reduce(
        addRegulatorToIngestionRun,
        ingestionRun
      );

      await updateIngestionRun(ingestionRun);

      if (regulators.length === 0) {
        logger.warn(
          'No regulators found in external provider, completing ingestion run',
          {
            ingestionRunId: ingestionRun.id,
            provider: ingestionRun.providerName,
          }
        );

        return await updateIngestionRun(completeIngestionRun(ingestionRun));
      }

      return ingestionRun;
    } catch (error) {
      logger.error('Error during rulebooks ingestion run', {
        ingestionRunId: ingestionRun.id,
        provider: ingestionRun.providerName,
        error,
      });

      await updateIngestionRun(
        failIngestionRun(
          ingestionRun,
          error instanceof Error
            ? error.message
            : 'Unknown error occurred during ingestion run'
        )
      );

      throw error;
    }
  };

  return { execute };
};
