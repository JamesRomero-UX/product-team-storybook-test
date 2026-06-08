import type { ExternalObligationsUpdatedEvent } from '@risksmart-app/events/src/types/org-events';
import { createObligationChangeRepositoryAdaptor } from 'src/adaptors/obligation-change-repository/obligation-changes';
import { createObligationRepositoryAdaptor } from 'src/adaptors/obligation-repository/obligations';
import { createRegulatorySourceRepositoryAdaptor } from 'src/adaptors/regulatory-source-repository/regulatory-sources';
import { createS3ObligationProvider } from 'src/adaptors/s3-obligation-provider';
import { getDatabaseConnection } from 'src/repositories/db-client';
import { createObligationChangeRepository } from 'src/repositories/obligation-change-repository';
import { createObligationRepository } from 'src/repositories/obligation-repository';
import { createRegulatorySourceRepository } from 'src/repositories/regulatory-source-repository';

import { createEnsureRegulatorySourcesExist } from './ensure-regulatory-sources-exist';
import { createOrchestrator } from './orchestrator';
import { createSyncExternalObligationChanges } from './sync-external-obligation-changes';
import { createSyncExternalObligations } from './sync-external-obligations';

const s3Client = createS3ObligationProvider();

export const processor = async (event: ExternalObligationsUpdatedEvent) => {
  // each tenant needs a separate database connection
  const db = await getDatabaseConnection({
    tenant: event.metadata.tenant,
    orgKey: event.metadata.orgKey,
  });

  const obligationsRepository = createObligationRepository(db);

  const obligationRepositoryAdaptor = createObligationRepositoryAdaptor({
    repository: obligationsRepository,
  });

  const regulatorySourceRepository = createRegulatorySourceRepository(db);

  const regulatorySourceRepositoryAdaptor =
    createRegulatorySourceRepositoryAdaptor({
      upsertRegulatorySources:
        regulatorySourceRepository.upsertRegulatorySource,
    });

  const ensureRegulatorySourcesExist = createEnsureRegulatorySourcesExist({
    saveRegulatorySources: regulatorySourceRepositoryAdaptor.save,
  });

  const syncExternalObligations = createSyncExternalObligations({
    saveExternalObligations: obligationRepositoryAdaptor.saveObligations,
    getObligationIdsByExternalIds: obligationsRepository.getIdsByExternalIds,
  });

  const obligationChangeRepository = createObligationChangeRepository(db);

  const obligationChangeRepositoryAdaptor =
    createObligationChangeRepositoryAdaptor({
      repository: obligationChangeRepository,
    });

  const syncExternalObligationChanges = createSyncExternalObligationChanges({
    saveExternalObligationChanges:
      obligationChangeRepositoryAdaptor.saveObligationChanges,
    getObligationIdsByExternalIds: obligationsRepository.getIdsByExternalIds,
  });

  return createOrchestrator({
    getObligationChangeSet: s3Client.getUpdatedExternalObligations,
    ensureRegulatorySourcesExist: ensureRegulatorySourcesExist.execute,
    processObligationUpdates: syncExternalObligations.processUpdates,
    processObligationAdditions: syncExternalObligations.processAdditions,
    processObligationChangeAdditions:
      syncExternalObligationChanges.processChanges,
    processObligationChangeUpdates:
      syncExternalObligationChanges.processChanges,
  })(event);
};
