import Box from '@risk-smart/themed-cloudscape-components/box';
import * as Sentry from '@sentry/browser';
import type { FC } from 'react';
import { useEffect } from 'react';
import { useRouteError } from 'react-router';

import { Forbidden, PageNotFound } from '../errors/errors';
import { getEnv } from '../utils/environment';
import { handleError } from '../utils/errorUtils';
import AccessDeniedPage from './AccessDeniedPage';
import DiagnosticSection from './DiagnosticSection';
import ErrorContent from './ErrorContent';
import NotFoundPage from './NotFoundPage';

const Page: FC = () => {
  const error = useRouteError();
  const isNotFound = error instanceof PageNotFound;
  const isForbidden = error instanceof Forbidden;
  useEffect(() => {
    if (isNotFound || isForbidden) {
      Sentry.captureMessage(error.message);

      return;
    }
    if (error) {
      handleError(error);
    }
  }, [error, isForbidden, isNotFound]);

  if (isNotFound) {
    return <NotFoundPage />;
  }
  if (isForbidden) {
    return <AccessDeniedPage />;
  }

  return (
    <>
      <ErrorContent
        title={"Sorry, we couldn't make that happen"}
        imgSrc={'/errors/rubiks-cube.png'}
        imgAlt={'binoculars'}
      >
        <Box variant={'p'}>{'Please try again later'}</Box>
      </ErrorContent>
      <DiagnosticSection
        endpoints={{
          graphqlUrl: getEnv('REACT_APP_TENANT_API_URL', true),
          restUrl: getEnv('REACT_APP_REST_API_URL', true),
          trpcUrl: getEnv('REACT_APP_TRPC_API_URL', true),
          externalUrl: getEnv('REACT_APP_EXTERNAL_API_URL', true),
          auth0Domain: getEnv('REACT_APP_AUTH0_DOMAIN', true),
        }}
      />
    </>
  );
};

export default Page;
