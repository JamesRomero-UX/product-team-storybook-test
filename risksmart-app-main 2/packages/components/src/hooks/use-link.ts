/**
 * Allows for the use of react-router's navigate function with Cloudscape
 * See: https://github.com/cloudscape-design/components/discussions/339
 * Source: https://github.com/CharlesStover/use-awsui-router/blob/main/docs/use-link.md
 */

import type { LinkProps } from '@risk-smart/themed-cloudscape-components/link';
import { useCallback } from 'react';
import type { NavigateFunction, NavigateOptions } from 'react-router';
import { useNavigate } from 'react-router';

import { isInternal } from '../routes/routes.utils';

export interface State {
  readonly handleFollow: (
    event: Readonly<CustomEvent<Readonly<LinkProps.FollowDetail>>>
  ) => void;
}

export default function useLink(options?: NavigateOptions): State {
  const navigate: NavigateFunction = useNavigate();
  const handleFollow = useCallback(
    (e: Readonly<CustomEvent<Readonly<LinkProps.FollowDetail>>>): void => {
      if (
        (e.detail.href && !isInternal(e.detail.href)) ||
        typeof e.detail.href === 'undefined'
      ) {
        return;
      }

      e.preventDefault();
      navigate(e.detail.href, options);
    },
    [navigate, options]
  );

  return {
    handleFollow,
  };
}
