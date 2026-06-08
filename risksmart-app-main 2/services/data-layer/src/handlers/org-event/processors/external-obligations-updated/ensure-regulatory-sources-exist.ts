import type {
  NewRegulatorySource,
  RegulatorySource,
} from '@risksmart-app/domain/src/types/regulatory-source';

import type { IngestedRegulatorySource } from './types';

export interface Dependencies {
  saveRegulatorySources: (
    sources: NewRegulatorySource[]
  ) => Promise<RegulatorySource[]>;
}

export const createEnsureRegulatorySourcesExist = ({
  saveRegulatorySources,
}: Dependencies) => {
  const hydrateRegulatorySource = (
    ingested: IngestedRegulatorySource,
    orgKey: string
  ): NewRegulatorySource => {
    const auditDate = new Date().toISOString();

    return {
      externalRegulatorId: ingested.id,
      regulatorName: ingested.name,
      providerName: ingested.providerName,
      orgKey,
      createdByUser: 'SYSTEM',
      modifiedByUser: 'SYSTEM',
      createdAtTimestamp: auditDate,
      modifiedAtTimestamp: auditDate,
    };
  };

  const execute = async ({
    ingestedRegulatorySources,
    orgKey,
  }: {
    ingestedRegulatorySources: IngestedRegulatorySource[];
    orgKey: string;
  }): Promise<RegulatorySource[]> =>
    await saveRegulatorySources(
      ingestedRegulatorySources.map((source) =>
        hydrateRegulatorySource(source, orgKey)
      )
    );

  return { execute };
};
