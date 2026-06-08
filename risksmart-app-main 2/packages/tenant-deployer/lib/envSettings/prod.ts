import { RemovalPolicy } from 'aws-cdk-lib';

import type { EnvSettings } from '../env';

export const prod: EnvSettings = {
  requestEventDynamoRemovalPolicy: RemovalPolicy.RETAIN,
};
