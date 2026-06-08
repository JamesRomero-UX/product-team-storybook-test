import {
  type NewRegulatorySource,
  type RegulatorySource,
  regulatorySourceSchema,
} from '@risksmart-app/domain/src/types/regulatory-source';
import type { regulatory_source } from '@risksmart-app/drizzle/src/schema';

export interface RegulatorySourceRepositoryDependencies {
  upsertRegulatorySources: (
    values: (typeof regulatory_source.$inferInsert)[]
  ) => Promise<(typeof regulatory_source.$inferSelect)[]>;
}

export const createRegulatorySourceRepositoryAdaptor = ({
  upsertRegulatorySources,
}: RegulatorySourceRepositoryDependencies) => {
  const save = async (
    regulatorySources: NewRegulatorySource[] | RegulatorySource[]
  ): Promise<RegulatorySource[]> => {
    const transformedItems = regulatorySources.map(transformDomainToDb);

    const result = await upsertRegulatorySources(transformedItems);

    return result.map(transformFromDbToDomain);
  };

  return { save };
};

const transformDomainToDb = (
  item: NewRegulatorySource | RegulatorySource
): typeof regulatory_source.$inferInsert =>
  ({
    ExternalRegulatorId: item.externalRegulatorId,
    RegulatorName: item.regulatorName,
    ProviderName: item.providerName,
    OrgKey: item.orgKey,
    CreatedByUser: item.createdByUser,
    ModifiedByUser: item.modifiedByUser,
    CreatedAtTimestamp: item.createdAtTimestamp,
    ModifiedAtTimestamp: item.modifiedAtTimestamp,
  }) satisfies typeof regulatory_source.$inferInsert;

const transformFromDbToDomain = (
  item: typeof regulatory_source.$inferSelect
): RegulatorySource =>
  regulatorySourceSchema.parse({
    id: item.Id,
    externalRegulatorId: item.ExternalRegulatorId,
    regulatorName: item.RegulatorName,
    providerName: item.ProviderName,
    orgKey: item.OrgKey,
    createdByUser: item.CreatedByUser,
    modifiedByUser: item.ModifiedByUser,
    createdAtTimestamp: item.CreatedAtTimestamp,
    modifiedAtTimestamp: item.ModifiedAtTimestamp,
  });
