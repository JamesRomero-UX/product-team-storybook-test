import { type ObligationId } from '@risksmart-app/domain/src/types/obligation';
import type { RegulatorySource } from '@risksmart-app/domain/src/types/regulatory-source';
import type { ExternalObligationsUpdatedEvent } from '@risksmart-app/events/src/types/org-events';

import { getLogger } from '../../../../utils/logger';
import type {
  IngestedRegulatorySource,
  NewIngestedObligation,
  NewIngestedObligationChange,
  ObligationChangeset,
} from './types';
const logger = getLogger();

export interface ProcessorDependencies {
  getObligationChangeSet: (options: {
    location: string;
  }) => Promise<ObligationChangeset[]>;

  ensureRegulatorySourcesExist: (source: {
    ingestedRegulatorySources: IngestedRegulatorySource[];
    orgKey: string;
  }) => Promise<RegulatorySource[]>;

  processObligationUpdates: (params: {
    regulatorySource: RegulatorySource;
    updates: NewIngestedObligation[];
    orgKey: string;
    externalSyncedAt: Date;
  }) => Promise<{ id: ObligationId; externalId: string }[]>;

  processObligationAdditions: (params: {
    regulatorySource: RegulatorySource;
    additions: NewIngestedObligation[];
    orgKey: string;
    externalSyncedAt: Date;
  }) => Promise<{ id: ObligationId; externalId: string }[]>;

  processObligationChangeAdditions: (params: {
    regulatorySource: RegulatorySource;
    changes: NewIngestedObligationChange[];
    orgKey: string;
    // externalSyncedAt: Date; // todo add this?
  }) => Promise<{ id: string; externalId: string }[]>;

  processObligationChangeUpdates: (params: {
    regulatorySource: RegulatorySource;
    changes: NewIngestedObligationChange[];
    orgKey: string;
    // externalSyncedAt: Date; // todo add this?
  }) => Promise<{ id: string; externalId: string }[]>;
}

export const createOrchestrator =
  ({
    getObligationChangeSet,
    ensureRegulatorySourcesExist,
    processObligationUpdates,
    processObligationAdditions,
    processObligationChangeAdditions,
    processObligationChangeUpdates,
  }: ProcessorDependencies) =>
  async (event: ExternalObligationsUpdatedEvent): Promise<void> => {
    logger.info('Processing ExternalObligationsUpdated event', { event });

    const { orgKey } = event.metadata;
    const externalSyncedAt = new Date();

    const changeSets = await getObligationChangeSet({
      location: event.data.location,
    });

    const regulatorySources = await ensureRegulatorySourcesExist({
      ingestedRegulatorySources: changeSets.map((cs) => cs.regulatorySource),
      orgKey,
    });

    for (const changeSet of changeSets) {
      const regulatorySource = regulatorySources.find(
        (source) => source.externalRegulatorId === changeSet.regulatorySource.id
      );

      if (!regulatorySource) {
        logger.error('Error getting regulatory source for changeset', {
          changeSetSource: changeSet.regulatorySource,
          availableSources: regulatorySources,
        });

        throw new Error('Regulatory source not found for changeset');
      }

      const updated = await processObligationUpdates({
        regulatorySource,
        updates: changeSet.obligations.updated,
        orgKey,
        externalSyncedAt,
      });

      const added = await processObligationAdditions({
        regulatorySource,
        additions: changeSet.obligations.added,
        orgKey,
        externalSyncedAt,
      });

      // obligation changes must be processed after obligations (FK constraint)
      await processObligationChangeUpdates({
        regulatorySource,
        changes: changeSet.obligationChanges.updated,
        orgKey,
      });

      await processObligationChangeAdditions({
        regulatorySource,
        changes: changeSet.obligationChanges.added,
        orgKey,
      });

      // notify other systems of changes here if needed

      logger.info('Finished processing change set', {
        addedCount: added.length,
        updatedCount: updated.length,
        regulatorySource: {
          id: regulatorySource.id,
          name: regulatorySource.regulatorName,
          provider: regulatorySource.providerName,
        },
      });
    }
  };
