import type { GetRoleAccessQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useContext } from 'react';

import { PermissionsContext } from './PermissionsContext';

type RoleAccess = GetRoleAccessQuery['role_access'][number];

export function useRoleAccess(): RoleAccess[] {
  const context = useContext(PermissionsContext)!;
  if (context === null) {
    throw new Error('useRoleAccess must be used within PermissionsProvider');
  }

  return context;
}
