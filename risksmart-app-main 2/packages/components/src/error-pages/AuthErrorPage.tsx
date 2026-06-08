import * as Sentry from '@sentry/browser';
import type { FC } from 'react';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { Navigate } from 'react-router';

import AccessDeniedPage from './AccessDeniedPage';
import ErrorPage from './ErrorPage';
import OrgNotFound from './OrgNotFoundPage';
import TokenExpiredPage from './TokenExpiredPage';
import UserNotFoundPage from './UserNotFoundPage';

const Page: FC = () => {
  const [searchParams] = useSearchParams();

  // See https://auth0.com/docs/libraries/common-auth0-library-authentication-errors
  const errorCode = searchParams.get('error-code');
  const errorDescription = searchParams.get('error_description');

  useEffect(() => {
    Sentry.captureMessage('Auth failed', {
      contexts: { 'Failure Detail': { errorCode, errorDescription } },
    });
  }, [errorCode, errorDescription]);

  if (
    errorCode === 'invalid_request' &&
    (errorDescription ===
      'parameter organization is required for this client' ||
      errorDescription ===
        'authorization request parameter organization must be an organization id')
  ) {
    return <OrgNotFound />;
  }

  if (
    errorCode === 'invalid_request' &&
    errorDescription === 'invitation not found or already used'
  ) {
    return <Navigate to={'/'} />;
  }

  if (
    errorCode === 'access_denied' &&
    errorDescription?.includes('not part of the org')
  ) {
    return <UserNotFoundPage />;
  }

  if (errorDescription === 'failed to obtain access token') {
    return <TokenExpiredPage />;
  }

  if (errorCode === 'access_denied') {
    return <AccessDeniedPage />;
  }

  return <ErrorPage />;
};

export default Page;
