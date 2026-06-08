import type { QueryConfig } from '../../db';

export const ingestionConfig = {
  columns: {
    OrgKey: false,
  },
} as const satisfies QueryConfig<'ingestion_config'>;
