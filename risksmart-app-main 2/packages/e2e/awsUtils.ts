import { InvokeCommand, LambdaClient, LogType } from '@aws-sdk/client-lambda';
import { fromSSO } from '@aws-sdk/credential-providers';

import { getEnv } from './environment';

const STAGE = getEnv('PR_STAGE');
const TECH_ADMIN_PROFILE = process.env.TECH_ADMIN_PROFILE || 'tech-admin';

export const invokeLambda = async (funcName: string, payload: unknown) => {
  const credentials = fromSSO({ profile: TECH_ADMIN_PROFILE });
  const regex = /^pr-\d+$/;
  const isPR = regex.test(STAGE);

  const client = isPR
    ? new LambdaClient({})
    : new LambdaClient({
        region: 'eu-west-2',
        credentials,
      });

  const command = new InvokeCommand({
    FunctionName: `${STAGE}-${funcName}`,
    Payload: JSON.stringify(payload),
    LogType: LogType.Tail,
  });

  await client.send(command);
};
