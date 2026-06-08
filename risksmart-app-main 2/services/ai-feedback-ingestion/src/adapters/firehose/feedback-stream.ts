import {
  FirehoseClient,
  type FirehoseClientConfig,
  PutRecordCommand,
} from '@aws-sdk/client-firehose';

import type {
  Feedback,
  FeedbackRecord,
  FeedbackStoragePublisher,
} from '../../domain/types';
import { getOptionalEnv, isLocalDevelopment } from '../../lib';

export interface FeedbackStreamConfig {
  deliveryStreamPrefix: string;
  firehoseClient?: FirehoseClientConfig;
}

const createFirehoseClient = (
  config?: FirehoseClientConfig
): FirehoseClient => {
  const localEndpoint = getOptionalEnv('LOCAL_AWS_ENDPOINT');
  if (isLocalDevelopment() && localEndpoint) {
    return new FirehoseClient({
      ...config,
      endpoint: localEndpoint,
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
      },
      region: getOptionalEnv('AWS_REGION') ?? 'eu-west-2',
    });
  }

  return new FirehoseClient(config ?? {});
};

export const createFeedbackStreamAdaptor = (
  config: FeedbackStreamConfig
): FeedbackStoragePublisher => {
  const client = createFirehoseClient(config.firehoseClient);

  const publish = async (
    tenantId: string,
    feedback: Feedback
  ): Promise<void> => {
    // Stream name: ${prefix}-${tenantId}-ai-feedback
    const streamName = `${config.deliveryStreamPrefix}-${tenantId}-ai-feedback`;

    // Serialize values object to JSON string for Parquet storage
    const record: FeedbackRecord = {
      ...feedback,
      values: JSON.stringify(feedback.values),
    };

    await client.send(
      new PutRecordCommand({
        DeliveryStreamName: streamName,
        Record: {
          // Firehose expects newline-delimited JSON for batching
          Data: Buffer.from(JSON.stringify(record) + '\n'),
        },
      })
    );
  };

  return { publish };
};
