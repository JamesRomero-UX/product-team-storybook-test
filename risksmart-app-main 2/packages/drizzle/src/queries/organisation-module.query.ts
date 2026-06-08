import type { QueryConfig } from '../db';
import { organisationModule } from './fragments/index';
import { modifiedByAndCreatedByUser } from './utils';

export const getOrganisationModuleByOrgQueryConfig = {
  ...organisationModule,
  with: {
    ...modifiedByAndCreatedByUser,
  },
} as const satisfies QueryConfig<'organisation_module'>;
