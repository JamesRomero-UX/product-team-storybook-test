import { getEnv } from '@risksmart-app/shared/src/utils/environment';
import { captureConsoleIntegration, init } from '@sentry/aws-serverless';

const enabledStages = ['dev-cloud', 'prod', 'staging'];

const stage = getEnv('STAGE');

const enabled = enabledStages.includes(stage);

export const initSentry = () => {
  init({
    //TODO: need to decided on how we manage this
    dsn: '-- SENTRY_DSN HERE --',
    integrations: [
      captureConsoleIntegration({
        levels: ['error', 'info'],
      }),
    ],
    tracesSampleRate: 1.0,
    environment: stage,
    release: getEnv('SENTRY_RELEASE'),
    enabled,
  });
};
