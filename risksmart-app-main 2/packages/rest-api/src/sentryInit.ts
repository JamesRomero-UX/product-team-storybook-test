import { captureConsoleIntegration, init } from '@sentry/aws-serverless';

import { getEnv } from './environment';

const enabledStages = ['dev-cloud', 'prod', 'staging'];

const enabled = enabledStages.includes(getEnv('SST_STAGE'));

export const initSentry = () => {
  init({
    dsn: 'https://f85ef052743dfb6ce59dd9c2205a7984@o4505232398745600.ingest.us.sentry.io/4507532551061504',
    integrations: [
      captureConsoleIntegration({
        levels: ['error', 'info'],
      }),
    ],

    // Add Tracing by setting tracesSampleRate and adding integration
    // Set tracesSampleRate to 1.0 to capture 100% of transactions
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
    environment: getEnv('SST_STAGE'),
    release: getEnv('SENTRY_RELEASE'),
    enabled,
  });
};
