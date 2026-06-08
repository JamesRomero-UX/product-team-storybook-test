import type { Auth0ContextInterface } from '@auth0/auth0-react';
import type { RisksmartUser } from '@risksmart-app/components/src/hooks/useRisksmartUser';

import type { User } from '../components/form/controlled-group-and-user-select/userBuilder';
import { stub } from './stub';

const defaultAuth0User: RisksmartUser = {
  userId: 'TestUser',
  orgKey: 'Org123',
  orgRole: 'RiskManager',
  allowedRoles: [],
  features: [],
  isCustomerSupport: false,
};

export const testAuth0User = stub<Auth0ContextInterface<RisksmartUser>>({
  user: defaultAuth0User,
});

export const buildAuth0User = (user: Partial<RisksmartUser> = {}) =>
  stub<Auth0ContextInterface<RisksmartUser>>({
    user: {
      ...defaultAuth0User,
      ...user,
    },
  });

export const testUser: User = {
  Id: testAuth0User.user?.userId,
  FriendlyName: 'Test User',
  RoleKey: '',
  Status: 'active',
  IsCustomerSupport: false,
};
