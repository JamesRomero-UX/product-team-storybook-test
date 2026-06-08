import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getOrganisationsQueryConfig } from '@risksmart-app/drizzle/src/queries/organisation.query';

export type OrganisationRow = InferQueryModel<
  'organisation',
  typeof getOrganisationsQueryConfig
>;
