import type { User } from '@auth0/auth0-react';

import type { Roles } from '../hooks/useRisksmartUser';
import { hasuraClaimsNamespace, hasuraDefaultRole } from '../rbac/jwt';

export function isUserInOrganization(user?: User) {
  return user?.claims_organization_name && user?.org_id;
}

export function getDefaultRole(user?: User): Roles {
  return user?.[hasuraClaimsNamespace][hasuraDefaultRole];
}

export function getOrganization(user?: User): Roles {
  return user?.claims_organization_name;
}
