import type { QueryConfig } from '../db';

/**
 * Query configuration for organisations
 */
export const getOrganisationsQueryConfig = {
  columns: {
    OrgKey: true,
    Name: true,
  },
} as const satisfies QueryConfig<'organisation'>;
