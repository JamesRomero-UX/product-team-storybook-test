import { Forbidden } from '@risksmart-app/components/src/errors/errors';
import type { FC, ReactNode } from 'react';

import type { FeatureFlagKey } from '@/utils/featureFlags';
import { isFeatureEnabled } from '@/utils/featureFlags';

type Props = {
  children: ReactNode;
  featureFlag: FeatureFlagKey;
};

const FeatureFlaggedRoute: FC<Props> = ({ children, featureFlag }) => {
  const enabled = isFeatureEnabled(featureFlag);
  if (enabled === null) {
    return <></>;
  }
  if (!enabled) {
    throw new Forbidden(`Access to ${featureFlag} denied`);
  }

  return children;
};

export default FeatureFlaggedRoute;
