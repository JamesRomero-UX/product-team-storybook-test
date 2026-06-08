import type { Auth0ContextInterface, User } from '@auth0/auth0-react';
import { useAuth0 } from '@auth0/auth0-react';
import type { Context } from 'react';

import {
  hasuraAllowedRoles,
  hasuraClaimsNamespace,
  hasuraDefaultRole,
  hasuraIsCustomerSupport,
  hasuraUserId,
} from '../rbac/jwt';

export type Roles =
  | 'CustomerSupport'
  | 'InternalAudit'
  | 'Public'
  | 'ReadOnly'
  | 'RiskManager'
  | 'Standard'
  | 'StandardEnhanced'
  | 'ThirdPartyRespondent';

export type RisksmartUser = User & {
  orgKey: string;
  orgRole: Roles;
  allowedRoles: string[];
  userId: string;
  isCustomerSupport: boolean;
};

const useRisksmartUser = (
  context?: Context<Auth0ContextInterface>
): Auth0ContextInterface<RisksmartUser> => {
  const { user, isLoading, ...rest } = useAuth0<RisksmartUser>(context);

  return user
    ? {
        ...rest,
        isLoading: false,
        user: {
          ...user,
          orgKey: user.org_id,
          orgRole: user?.[hasuraClaimsNamespace][hasuraDefaultRole],
          allowedRoles: user?.[hasuraClaimsNamespace][hasuraAllowedRoles],
          userId: user?.[hasuraClaimsNamespace][hasuraUserId],
          isCustomerSupport:
            user?.[hasuraClaimsNamespace][hasuraIsCustomerSupport] === 'true',
        },
      }
    : { user: undefined, isLoading, ...rest };
};

export default useRisksmartUser;
