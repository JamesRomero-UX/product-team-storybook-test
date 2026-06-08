import type { JSONB } from '@risksmart-app/domain/src/types';
import { ObligationType } from '@risksmart-app/domain/src/types/consts';
import {
  type NewObligation,
  type ObligationId,
} from '@risksmart-app/domain/src/types/obligation';
import type { obligation } from '@risksmart-app/drizzle/src/schema';

import { externalObligationSchema } from './types';

interface ObligationsRepository {
  upsertExternalObligations: (
    values: (typeof obligation.$inferInsert)[]
  ) => Promise<(typeof obligation.$inferInsert)[]>;
}

export interface ObligationsAdaptorDependencies {
  repository: ObligationsRepository;
}

export const createObligationRepositoryAdaptor = ({
  repository,
}: ObligationsAdaptorDependencies) => {
  const saveObligations = async (
    obligations: NewObligation[]
  ): Promise<{ id: ObligationId; externalId: string }[]> => {
    const transformedObligations = obligations.map(transformDomainToDb);

    const result = await repository.upsertExternalObligations(
      transformedObligations
    );

    return result.map((row) => {
      // external ID can never be null as we're saving external obligations
      const parsed = externalObligationSchema.parse(row);

      return {
        id: parsed.Id,
        externalId: parsed.ExternalId,
      };
    });
  };

  return { saveObligations };
};

const mapType = (type: NewObligation['type']): ObligationType => {
  switch (type) {
    case 'standard':
      return ObligationType.Standard;
    case 'chapter':
      return ObligationType.Chapter;
    case 'rule':
      return ObligationType.Rule;
    case 'task':
      return ObligationType.Task;
  }
};

const transformDomainToDb = (
  newObligation: NewObligation
): typeof obligation.$inferInsert => {
  const dbObligation: typeof obligation.$inferInsert = {
    Adherence: newObligation.adherence,
    ContentHash: newObligation.contentHash ?? null,
    CreatedByUser: newObligation.createdByUser,
    CustomAttributeData: (newObligation.customAttributeData as JSONB) ?? null,
    Description: newObligation.description,
    ExternalId: newObligation.externalId,
    ExternalSyncedAt: newObligation.externalSyncedAt?.toISOString(),
    Interpretation: newObligation.interpretation,
    ModifiedByUser: newObligation.modifiedByUser,
    OrgKey: newObligation.orgKey,
    ParentId: newObligation.parentId,
    RegulatorySourceId: newObligation.regulatorySourceId,
    SequentialId: newObligation.sequentialId ?? null,
    Title: newObligation.title,
    Type: mapType(newObligation.type),
    Reference: newObligation.reference,
    SourceUrl: newObligation.sourceUrl,
  };

  return dbObligation;
};
