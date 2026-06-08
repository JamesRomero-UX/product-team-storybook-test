import type { ObligationId } from '@risksmart-app/domain/src/types/obligation';
import type { NewObligationChange } from '@risksmart-app/domain/src/types/obligation-change';
import type {
  RegulatorySource,
  RegulatorySourceId,
} from '@risksmart-app/domain/src/types/regulatory-source';

import { getLogger } from '../../../../utils/logger';
import type { NewIngestedObligationChange, ParentIdMap } from './types';

const logger = getLogger();

interface Dependencies {
  saveExternalObligationChanges: (
    changes: NewObligationChange[]
  ) => Promise<{ id: string; externalId: string }[]>;

  getObligationIdsByExternalIds: (
    externalIds: string[],
    orgKey: string,
    regulatorySourceId: RegulatorySourceId
  ) => Promise<ParentIdMap>;
}

export const createSyncExternalObligationChanges = ({
  saveExternalObligationChanges,
  getObligationIdsByExternalIds,
}: Dependencies) => {
  const hydrateObligationChange = (
    ingested: NewIngestedObligationChange,
    orgKey: string,
    obligationId: ObligationId
  ): NewObligationChange => ({
    externalId: ingested.externalId,
    obligationId,
    descriptionBefore: ingested.description.before,
    descriptionAfter: ingested.description.after,
    rationale: ingested.rationale ?? null,
    effectiveDate: ingested.effectiveDate
      ? new Date(ingested.effectiveDate) // we're mapping this to a date, then back to a string in the repository adaptor — is this necessary?
      : null,
    sourceUrl: ingested.sourceUrl ?? null,
    contentHash: ingested.contentHash,
    orgKey,
    createdByUser: 'SYSTEM',
    modifiedByUser: 'SYSTEM',
  });

  const processChanges = async ({
    regulatorySource,
    changes,
    orgKey,
  }: {
    regulatorySource: RegulatorySource;
    changes: NewIngestedObligationChange[];
    orgKey: string;
  }): Promise<{ id: string; externalId: string }[]> => {
    if (changes.length === 0) {
      return [];
    }

    const parentExternalIds = [
      ...new Set(changes.map((c) => c.externalParentId)),
    ];

    const parentIdMap = await getObligationIdsByExternalIds(
      parentExternalIds,
      orgKey,
      regulatorySource.id
    );

    const hydrated: NewObligationChange[] = [];

    for (const change of changes) {
      const parent = parentIdMap.get(change.externalParentId);

      if (!parent) {
        logger.warn(
          'Parent obligation not found for obligation change — skipping',
          {
            externalId: change.externalId,
            externalParentId: change.externalParentId,
          }
        );
        continue;
      }

      hydrated.push(
        hydrateObligationChange(change, orgKey, parent.obligationId)
      );
    }

    return saveExternalObligationChanges(hydrated);
  };

  return { processChanges };
};
