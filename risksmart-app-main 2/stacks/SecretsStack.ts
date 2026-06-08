import { Config, StackContext } from 'sst/constructs';

export function Secrets({ stack }: StackContext) {
  const HASURA_ADMIN_SECRET = new Config.Secret(stack, 'HASURA_ADMIN_SECRET');
  const REST_API_KEY = new Config.Secret(stack, 'REST_API_KEY');
  const KNOCK_SECRET_KEY = new Config.Secret(stack, 'KNOCK_SECRET_KEY');
  const SLACK_CLIENT_SECRET = new Config.Secret(stack, 'SLACK_CLIENT_SECRET');
  const AUTH0_CLIENT_SECRET = new Config.Secret(stack, 'AUTH0_CLIENT_SECRET');
  const INTEGRATION_SECRET = new Config.Secret(stack, 'INTEGRATION_SECRET');
  const PDP_API_KEY = new Config.Secret(stack, 'PDP_API_KEY');
  const HYBISCUS_API_KEY = new Config.Secret(stack, 'HYBISCUS_API_KEY');
  const PENSIONBEE_EXPORT_BUCKET = new Config.Parameter(
    stack,
    'PENSIONBEE_EXPORT_BUCKET',
    {
      value: 'risksmart-pensionbee-data-export',
    }
  );

  return {
    HASURA_ADMIN_SECRET,
    REST_API_KEY,
    KNOCK_SECRET_KEY,
    SLACK_CLIENT_SECRET,
    AUTH0_CLIENT_SECRET,
    INTEGRATION_SECRET,
    PDP_API_KEY,
    HYBISCUS_API_KEY,
    PENSIONBEE_EXPORT_BUCKET,
  };
}
