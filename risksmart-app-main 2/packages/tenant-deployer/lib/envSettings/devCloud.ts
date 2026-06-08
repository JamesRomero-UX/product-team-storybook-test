import { RemovalPolicy } from 'aws-cdk-lib';

import type { EnvSettings } from '../env';

export const devCloud: EnvSettings = {
  requestEventDynamoRemovalPolicy: RemovalPolicy.DESTROY,
};
