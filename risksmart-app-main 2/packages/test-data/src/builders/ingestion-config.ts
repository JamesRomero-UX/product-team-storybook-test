import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';

export const buildIngestionConfig = ({
  orgKey,
  userId,
  overrides,
}: {
  orgKey: string;
  userId: string;
  overrides?: Partial<InferInsertModel<'ingestion_config'>>;
}): InferInsertModel<'ingestion_config'> => ({
  OrgKey: orgKey,
  IngestionConfig: { source: 'test', enabled: true },
  SecretArn: null,
  CreatedByUser: userId,
  ModifiedByUser: userId,
  ModifiedAtTimestamp: new Date().toISOString(),
  CreatedAtTimestamp: new Date().toISOString(),
  ...overrides,
});
