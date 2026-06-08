import { RemovalPolicy } from 'aws-cdk-lib';

import type { EnvSettings } from '../env';

export const techAdmin: EnvSettings = {
  requestEventDynamoRemovalPolicy: RemovalPolicy.DESTROY,
};
