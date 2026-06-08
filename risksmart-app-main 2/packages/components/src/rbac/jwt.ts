import type { User } from '@auth0/auth0-react';

export const hasuraClaimsNamespace = 'https://hasura.io/jwt/claims';

export const hasuraAllowedRoles = 'x-hasura-allowed-roles';

export const hasuraDefaultRole = 'x-hasura-default-role';

export const hasuraUserId = 'x-hasura-user-id';

export const orgId = 'org_id';

export const logo = 'x-hasura-logo';

export const appLogo = 'x-hasura-applogo';

export const getUserId = (user: undefined | User) =>
  user?.[hasuraClaimsNamespace][hasuraUserId];

export const hasuraIsCustomerSupport = 'x-hasura-is-customer-support';
