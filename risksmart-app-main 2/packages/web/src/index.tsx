import '@fontsource/sora/400.css';
import '@fontsource/sora/600.css';
import '@fontsource/sora/700.css';
import '@fontsource/sora/800.css';
import 'highcharts/esm/highcharts';

import { loadDevMessages, loadErrorMessages } from '@apollo/client/dev';
import I18NProvider from '@risksmart-app/components/src/providers/I18nProvider';
import { getEnv } from '@risksmart-app/components/src/utils/environment';
import * as Sentry from '@sentry/react';
import type { AxiosError } from 'axios';
import { isAxiosError } from 'axios';
import { StrictMode, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router';

import { App } from './App';

function handleSentryBeforeSend(
  event: Sentry.ErrorEvent,
  hint: Sentry.EventHint
) {
  addAxiosContextRecursive(event, hint?.originalException);

  return event;
}

function addAxiosContextRecursive(event: Sentry.ErrorEvent, error: unknown) {
  if (isAxiosError(error)) {
    addAxiosContext(event, error);
  } else if (error instanceof Error && error.cause) {
    addAxiosContextRecursive(event, error.cause);
  }
}

function addAxiosContext(event: Sentry.ErrorEvent, error: AxiosError) {
  if (error.response) {
    const contexts = { ...event.contexts };
    contexts.Axios = { Response: error.response };
    event.contexts = contexts;
  }
}

if (
  getEnv('REACT_APP_ENVIRONMENT') === 'dev-local' ||
  getEnv('REACT_APP_ENVIRONMENT') === 'dev-cloud' ||
  getEnv('REACT_APP_ENVIRONMENT') === 'staging'
) {
  // Adds messages only in a dev environment
  loadDevMessages();
  loadErrorMessages();
}

// TODO: lots of other settings to try out later!!!
Sentry.init({
  dsn: 'https://b2780d88dbf149ea915846fa910e9d6f@o4505232398745600.ingest.sentry.io/4505232587489280',
  environment: getEnv('REACT_APP_ENVIRONMENT'),
  integrations: [
    Sentry.reactRouterV6BrowserTracingIntegration({
      useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    }),

    Sentry.replayIntegration({
      // Additional SDK configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.0,
  sampleRate: 1.0,
  tracesSampleRate: 1.0,
  beforeSend: handleSentryBeforeSend,
  enabled: getEnv('REACT_APP_ENABLE_SENTRY', true) == 'true',
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <I18NProvider>
      <App />
    </I18NProvider>
  </StrictMode>
);
