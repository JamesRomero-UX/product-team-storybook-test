import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getOrganisationModuleByOrgQueryConfig } from '@risksmart-app/drizzle/src/queries/organisation-module.query';

export type GetOrganisationModuleByOrgIdResponseRow = InferQueryModel<
  'organisation_module',
  typeof getOrganisationModuleByOrgQueryConfig
>;

export interface OrganisationModuleByOrgIdResponse {
  organisationModule: GetOrganisationModuleByOrgIdResponseRow | null;
}
