import { InvokeCommand, LambdaClient, LogType } from '@aws-sdk/client-lambda';
import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';

const sqsClient = new SQSClient({});
const lambdaClient = new LambdaClient({});
const env: 'staging' | 'dev-cloud' | 'prod' = 'dev-cloud';
const account = 'TODO';

/*Action Due */
//const SQS_QUEUE_URL = `https://sqs.eu-west-2.amazonaws.com/${account}/${env}-ActionDue-poller-dql`;
//const LAMBDA_FUNCTION_NAME = `${env}-ActionDuePoller`;

/*Action overdue*/
//const SQS_QUEUE_URL = `https://sqs.eu-west-2.amazonaws.com/${account}/${env}-ActionOverdue-poller-dql`;
//const LAMBDA_FUNCTION_NAME = `${env}-ActionOverduePoller`;

/*Issue Due*/
//const SQS_QUEUE_URL = `https://sqs.eu-west-2.amazonaws.com/${account}/${env}-IssueDue-poller-dql`;
//const LAMBDA_FUNCTION_NAME = `${env}-IssueDuePoller`;

/*Issue overdue*/
//const SQS_QUEUE_URL = `https://sqs.eu-west-2.amazonaws.com/${account}/${env}-IssueOverdue-poller-dql`;
//const LAMBDA_FUNCTION_NAME = `${env}-IssueOverduePoller`;

/*Policy review due */
const SQS_QUEUE_URL = `https://sqs.eu-west-2.amazonaws.com/${account}/${env}-PolicyDocumentVersionReviewDue-poller-dql`;
const LAMBDA_FUNCTION_NAME = `${env}-PolicyDocumentVersionReviewDuePoller`;

const receiveMessage = async () => {
  console.log('Requesting message', SQS_QUEUE_URL);

  return await sqsClient.send(
    new ReceiveMessageCommand({
      MaxNumberOfMessages: 1,
      MessageAttributeNames: ['All'],
      QueueUrl: SQS_QUEUE_URL,
      WaitTimeSeconds: 20,
      VisibilityTimeout: 20,
    })
  );
};

const invokeLambda = async (payload: string | undefined) => {
  const command = new InvokeCommand({
    FunctionName: LAMBDA_FUNCTION_NAME,
    Payload: payload,
    LogType: LogType.Tail,
  });

  return await lambdaClient.send(command);
};

const deleteMessage = async (receiptHandle: string | undefined) => {
  console.log('Deleting message');
  await sqsClient.send(
    new DeleteMessageCommand({
      QueueUrl: SQS_QUEUE_URL,
      ReceiptHandle: receiptHandle,
    })
  );
};

// TODO: use tenants in stacks directory!
export const tenants = [
  { name: 'MultiTenant', nonProd: true },
  { name: 'OctoEnergy', nonProd: true },
  { name: 'CanaryRisk', nonProd: false },
  { name: 'DLA', nonProd: false },
  { name: 'MSL', nonProd: false },
  { name: 'JenstenGroup', nonProd: false },
  { name: 'Education', nonProd: false },
  { name: 'Sandbox', nonProd: false },
  { name: 'RightMove', nonProd: false },
  { name: 'PXC', nonProd: false },
] as const;

const getTenant = (resource: string) => {
  for (const tenant of tenants) {
    if (resource.indexOf(tenant.name) > -1) {
      return tenant;
    }
  }
  throw new Error('Tenant not found');
};

const retryMessage = async (): Promise<boolean> => {
  const { Messages } = await receiveMessage();

  if (!Messages || Messages.length === 0) {
    console.log('No messages found');

    return true;
  }
  console.log('Message found');
  const payload = JSON.parse(Messages[0].Body!);
  // This is a fix to a very specific bug that will probably never be needed again.
  const tenant = getTenant(payload.resources[0]);
  payload.detail.tenant = tenant.name;
  const skipReplay = false; //env === 'staging' && !tenant.nonProd;
  if (!skipReplay) {
    const result = await invokeLambda(JSON.stringify(payload));
    if (result.StatusCode === 200 && !result.FunctionError) {
      console.log('Message replayed successfully');
    } else {
      console.log(
        'Replay failed',
        result.StatusCode,
        result.FunctionError,
        payload
      );

      return true;
    }
  } else {
    console.log('Skipping replay');
  }
  if (Messages.length === 1) {
    await deleteMessage(Messages[0].ReceiptHandle);

    return false;
  }

  return true;
};

(async function () {
  let counter = 0;
  let exit = false;
  do {
    counter++;
    console.log('Request', counter);
    exit = await retryMessage();
    if (exit) {
      return;
    }
  } while (!exit);
})();
