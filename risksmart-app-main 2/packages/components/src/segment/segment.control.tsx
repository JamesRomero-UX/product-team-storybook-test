import { useEffect } from 'react';
import { useLocation } from 'react-router';

import useRisksmartUser from '../hooks/useRisksmartUser';
import { hasuraClaimsNamespace, hasuraDefaultRole } from '../rbac/jwt';
import { handleError } from '../utils/errorUtils';
import { useAmplitude, useSegment } from './useAnalytics';

export const useBaseTracking = () => {
  const location = useLocation();
  const segment = useSegment();
  const amplitude = useAmplitude();
  const { isLoading, isAuthenticated, user } = useRisksmartUser();
  const pathname = location?.pathname;

  useEffect(() => {
    // Only proceed when auth status settled & authenticated
    if (isLoading || !isAuthenticated) {
      return;
    }

    // Track page view in Segment
    void segment
      .page(
        pathname,
        {
          title: 'Removed due to security',
        },
        {
          page: {
            title: 'Removed due to security',
          },
          properties: {
            title: 'Removed due to security',
          },
        }
      )
      .catch((error: unknown) => {
        handleError(error);
      });

    amplitude.logEvent('Page Viewed', {
      'Page URL': pathname,
      'Page Title': 'Removed due to security',
    });
  }, [isLoading, isAuthenticated, pathname, segment, amplitude, user?.orgKey]);
};

export const useUserTracking = () => {
  const { isLoading, isAuthenticated, user } = useRisksmartUser();
  const segment = useSegment();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Track group in Segment
        void segment
          .group(
            user?.orgKey,
            {
              name: user?.claims_organization_name,
            },
            {
              page: {
                title: 'Removed due to security',
              },
            }
          )
          .catch((error: unknown) => {
            handleError(error);
          });

        // Track user identification in Segment
        void segment
          .identify(
            user?.userId,
            {
              email: user?.claims_email,
              name: user?.claims_username,
              org_role: user?.[hasuraClaimsNamespace]?.[hasuraDefaultRole],
            },
            {
              page: {
                title: 'Removed due to security',
              },
            }
          )
          .catch((error: unknown) => {
            handleError(error);
          });
      }
    }
  }, [isAuthenticated, isLoading, user, segment]);
};
