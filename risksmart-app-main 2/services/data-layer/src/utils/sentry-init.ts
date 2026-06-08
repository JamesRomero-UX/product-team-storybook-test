import { getEnv } from '@risksmart-app/shared/src/utils/environment';
import { captureConsoleIntegration, init } from '@sentry/aws-serverless';

const enabledStages = ['dev-cloud', 'prod', 'staging'];

const stage = getEnv('STAGE');

const enabled = enabledStages.includes(stage);

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
    // Adjusting this value in production
    tracesSampleRate: 1.0,
    environment: stage,
    release: getEnv('SENTRY_RELEASE'),
    enabled,
  });
};
