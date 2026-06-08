import dotenv from 'dotenv';
import path from 'path';

import { sendToEventBridge } from './clients/eventBridgeClient';
import { warmRestAPICatchAll } from './clients/utils';

dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});

export async function setup() {
  console.log(
    "Sending test request to 'warm' up catch all lambda in the hope we won't lose events for some unknown reason!"
  );
  await warmRestAPICatchAll();

  await sendToEventBridge([
    {
      Time: new Date(),
      DetailType: 'Testing',
      Detail: JSON.stringify({ tenant: 'MultiTenant' }),
    },
  ]);
}
