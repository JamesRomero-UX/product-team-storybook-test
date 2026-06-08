import { RemovalPolicy } from 'aws-cdk-lib';

import type { EnvSettings } from '../env';

export const staging: EnvSettings = {
  requestEventDynamoRemovalPolicy: RemovalPolicy.DESTROY,
};
