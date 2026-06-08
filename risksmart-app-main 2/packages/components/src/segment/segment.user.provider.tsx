import type { FC, ReactNode } from 'react';

import { useUserTracking } from './segment.control';

export const AnalyticsUserProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  useUserTracking();

  return <>{children}</>;
};
