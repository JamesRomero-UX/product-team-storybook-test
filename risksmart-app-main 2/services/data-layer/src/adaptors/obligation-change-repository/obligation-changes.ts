import type { NewObligationChange } from '@risksmart-app/domain/src/types/obligation-change';
import type { obligation_change } from '@risksmart-app/drizzle/src/schema';

import { externalObligationChangeSchema } from './types';

interface ObligationChangesRepository {
  upsertExternalObligationChanges: (
    values: (typeof obligation_change.$inferInsert)[]
  ) => Promise<(typeof obligation_change.$inferInsert)[]>;
}

export interface ObligationChangesAdaptorDependencies {
  repository: ObligationChangesRepository;
}

export const createObligationChangeRepositoryAdaptor = ({
  repository,
}: ObligationChangesAdaptorDependencies) => {
  const saveObligationChanges = async (
    changes: NewObligationChange[]
  ): Promise<{ id: string; externalId: string }[]> => {
    const transformed = changes.map(transformDomainToDb);

    const result =
      await repository.upsertExternalObligationChanges(transformed);

    return result.map((row) => {
      const parsed = externalObligationChangeSchema.parse(row);

      return {
        id: parsed.Id,
        externalId: parsed.ExternalId,
      };
    });
  };

  return { saveObligationChanges };
};

const transformDomainToDb = (
  change: NewObligationChange
): typeof obligation_change.$inferInsert => ({
  ExternalId: change.externalId,
  ObligationId: change.obligationId,
  DescriptionBefore: change.descriptionBefore,
  DescriptionAfter: change.descriptionAfter,
  Rationale: change.rationale ?? null,
  ContentHash: change.contentHash,
  EffectiveDate: change.effectiveDate
    ? change.effectiveDate.toISOString()
    : null,
  SourceUrl: change.sourceUrl ?? null,
  OrgKey: change.orgKey,
  CreatedByUser: change.createdByUser,
  ModifiedByUser: change.modifiedByUser,
});
