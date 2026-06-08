import { Knock } from '@knocklabs/node';
import type { SQSHandler } from 'aws-lambda';
import type { User } from 'generated/graphql';
import { getLogger } from 'src/logger';
import { Config } from 'sst/node/config';

import type { DataChangeEvent } from '../events/DataChangeEvent';

const logger = getLogger();

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const handler: SQSHandler = async (e) => {
  try {
    const messages = e.Records.map(
      (record) =>
        JSON.parse(record.body).detail as DataChangeEvent<User, 'user'>
    );

    if (process.env.IS_LOCAL) {
      // Don't delete user in knock during integration tests or local dev
      logger.info(
        'Skipping knock user deletions in integration tests and local dev'
      );

      return;
    }

    for (const message of messages) {
      logger.info('DeleteKnockUser', {
        op: message.event.op,
      });

      if (message.table.name !== 'user') {
        throw new Error('Only user events are supported');
      }

      if (message.event.op !== 'DELETE') {
        throw new Error('Only DELETE events are supported');
      }

      const knockClient = new Knock(Config.KNOCK_SECRET_KEY);
      if (message.event.op === 'DELETE') {
        const { Id } = message.event.data.old;
        if (Id) {
          logger.info('Deleting user from knock.', {
            userId: Id,
          });
          await retryWithBackoff(() => knockClient.users.delete(Id));
          logger.info('User deleted from knock', {
            userId: Id,
          });
        }
      }

      // Delay to avoid knock rate limiting of 5 requests per second
      // (Up to 5 concurrent lambdas * 1 request per second)
      await delay(1000);
    }
  } catch (error) {
    logger.error('Error deleting knock user', { error });
    throw error;
  }
};

const retryWithBackoff = async (
  fn: () => Promise<null>,
  retries: number = 3
) => {
  for (let i = 0; i < retries; i++) {
    try {
      await fn();

      return;
    } catch (error: unknown) {
      const typedError = error as { status?: number };
      if (typedError?.status === 429 && i < retries - 1) {
        const delay = Math.pow(2, i) * 100; // Exponential backoff delay
        logger.warn(`Rate limited by knock. Retry ${i + 1} in ${delay}ms`);
        await new Promise((res) => setTimeout(res, delay));
      } else {
        throw error;
      }
    }
  }
};
