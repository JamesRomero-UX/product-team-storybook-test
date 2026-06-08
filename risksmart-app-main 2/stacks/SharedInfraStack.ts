import * as iam from 'aws-cdk-lib/aws-iam';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { EventBus, StackContext } from 'sst/constructs';
import { RISKSMART_REGION_PREFIX } from './constants';

export function SharedInfraStack({ stack }: StackContext) {
  const sharedEventBus = new EventBus(stack, 'SharedEventBus');

  const dataChangeDlq = new Queue(stack, `SharedDataChangeDlq`, {
    queueName: `${RISKSMART_REGION_PREFIX}${stack.stage}-shared-data-change-dlq`,
  });

  const invokeInternalApiPermission = new iam.PolicyStatement({
    actions: ['execute-api:Invoke'],
    resources: [`arn:aws:execute-api:${stack.region}:${stack.account}:*/*/*/*`],
  });

  return { sharedEventBus, dataChangeDlq, invokeInternalApiPermission };
}
