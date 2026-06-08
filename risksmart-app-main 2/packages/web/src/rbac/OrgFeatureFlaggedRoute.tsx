import { Forbidden } from '@risksmart-app/components/src/errors/errors';
import type { FeatureFlag } from '@risksmart-app/modules/src/index';
import type { FC, ReactNode } from 'react';
import { useIsFeatureFlagEnabled } from 'src/hooks/useIsFeatureFlagEnabled';

type Props = {
  children: ReactNode;
  featureFlag: FeatureFlag;
  fallback?: ReactNode;
};

/**
 * Route guard that checks if a feature flag (non-module-backed) is enabled
 * via the org features array or environment variables.
 *
 * For module-backed features, use `ModuleGatedRoute` instead.
 */
const OrgFeatureFlaggedRoute: FC<Props> = ({
  children,
  featureFlag,
  fallback,
}) => {
  const enabled = useIsFeatureFlagEnabled(featureFlag);

  if (enabled) {
    return children;
  }

  if (fallback) {
    return fallback;
  }

  throw new Forbidden(`Access to feature ${featureFlag} denied`);
};

export default OrgFeatureFlaggedRoute;
