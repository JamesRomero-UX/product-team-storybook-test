import type { QueryConfig } from '../db';
import { ingestionConfig } from './fragments/index';

export const getIngestionConfigsQueryConfig = {
  ...ingestionConfig,
} as const satisfies QueryConfig<'ingestion_config'>;
