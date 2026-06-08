import type { QueryConfig } from '../../db';

export const organisationModule = {
  columns: {
    OrgKey: false,
  },
} as const satisfies QueryConfig<'organisation_module'>;
