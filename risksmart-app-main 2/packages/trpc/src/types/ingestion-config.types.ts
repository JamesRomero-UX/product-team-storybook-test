import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getIngestionConfigsQueryConfig } from '@risksmart-app/drizzle/src/queries/ingestion-config.query';

export type IngestionConfigResponseRow = InferQueryModel<
  'ingestion_config',
  typeof getIngestionConfigsQueryConfig
>;
