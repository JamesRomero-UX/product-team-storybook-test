import { Forbidden } from '@risksmart-app/components/src/errors/errors';
import type { FC, ReactNode } from 'react';

import type { ObjectAccess } from './Permission';
import { useHasPermissionQuery } from './useHasPermission';

type Props = {
  children: ReactNode;
  permission: ObjectAccess | ObjectAccess[];
  fallback?: ReactNode;
  canHaveAccessAsContributor?: true;
};

const ProtectedRoute: FC<Props> = ({
  children,
  permission,
  fallback,
  canHaveAccessAsContributor,
}) => {
  const { hasPermission: hasAccess, loading } = useHasPermissionQuery(
    permission,
    undefined,
    canHaveAccessAsContributor
  );

  if (hasAccess === null || loading) {
    return <></>;
  }
  if (!hasAccess) {
    if (fallback) {
      return fallback;
    }
    throw new Forbidden(`Access to ${permission} denied`);
  }

  return children;
};

export default ProtectedRoute;
