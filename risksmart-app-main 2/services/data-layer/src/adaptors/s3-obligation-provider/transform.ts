import type {
  IngestedRegulatorySource,
  NewIngestedObligation,
  NewIngestedObligationChange,
  ObligationChangeset,
} from 'src/handlers/org-event/processors/external-obligations-updated/types';

import type {
  IngestionServiceObligation,
  IngestionServiceObligationChange,
  RegulatorChangeResult,
} from './types';

const transformIngestionToNewObligation = (
  ingestionObligation: IngestionServiceObligation,
  regulatorySource: IngestedRegulatorySource
): NewIngestedObligation => {
  // todo not all of the fields are mapped here yet. Add the rest as needed.
  const externalObligation: NewIngestedObligation = {
    description: ingestionObligation.description ?? '',
    externalId: ingestionObligation.externalId,
    externalParentId: ingestionObligation.externalParentId ?? null,
    title: ingestionObligation.title,
    type: ingestionObligation.type,
    contentHash: ingestionObligation.contentHash ?? null,
    sourceUrl: ingestionObligation.sourceUrl || null,
    reference: ingestionObligation.referenceCode ?? null,
    regulatorySourceId: regulatorySource.id,
  };

  return externalObligation;
};

const transformIngestionToNewObligationChange = (
  ingestionChange: IngestionServiceObligationChange,
  regulatorySource: IngestedRegulatorySource
): NewIngestedObligationChange => ({
  // ingestion change mirrors NewIngestedObligationChange, so this feels a little unnecessary but
  // it's decoupling the internal domain from the ingestion format, which could be beneficial if we want to evolve the internal domain separately from the ingestion format.
  externalId: ingestionChange.externalId,
  externalParentId: ingestionChange.externalParentId,
  description: {
    before: ingestionChange.description.before,
    after: ingestionChange.description.after,
  },
  rationale: ingestionChange.rationale,
  effectiveDate: ingestionChange.effectiveDate,
  sourceUrl: ingestionChange.sourceUrl,
  contentHash: ingestionChange.contentHash,
  regulatorySourceId: regulatorySource.id,
});

export const transformIngestionToObligationChangeset = (
  regulatorySource: IngestedRegulatorySource,
  regulatorChangeSet: RegulatorChangeResult
): ObligationChangeset => {
  return {
    regulatorySource,
    obligations: {
      added: regulatorChangeSet.obligations.added.map((o) =>
        transformIngestionToNewObligation(o, regulatorySource)
      ),
      updated: regulatorChangeSet.obligations.updated.map((o) =>
        transformIngestionToNewObligation(o, regulatorySource)
      ),
    },
    obligationChanges: {
      added: regulatorChangeSet.obligationChanges.added.map((c) =>
        transformIngestionToNewObligationChange(c, regulatorySource)
      ),
      updated: regulatorChangeSet.obligationChanges.updated.map((c) =>
        transformIngestionToNewObligationChange(c, regulatorySource)
      ),
    },
  } satisfies ObligationChangeset;
};
