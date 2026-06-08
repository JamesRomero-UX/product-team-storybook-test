import type { GetRoleAccessQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createContext } from 'react';

export const PermissionsContext = createContext<
  GetRoleAccessQuery['role_access'] | null
>(null);
