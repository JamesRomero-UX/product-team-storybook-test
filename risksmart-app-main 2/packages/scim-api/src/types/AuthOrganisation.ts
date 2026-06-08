import type { GetOrganisationQuery } from 'generated/graphql';

/** Derived from GetOrganisation query for auth_organisation event payloads. */
export type AuthOrganisation = NonNullable<
  GetOrganisationQuery['auth_organisation_by_pk']
>;
