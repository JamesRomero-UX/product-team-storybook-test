import { AWSDynamoDBClient } from '../aws/dynamo-client';
import {
  DEFAULT_CONSUME_POINTS,
  DEFAULT_RATE_LIMIT_PROFILE,
  rateLimitProfiles,
} from '../config/rate-limiter.config';
import { dynamoRateLimiter } from './dynamo.rate-limiter';

interface CreateDynamoRateLimiterProps {
  tableName: string;
  dynamoDBEndpoint?: string;
  basePath: string;
}

export const createRateLimiter = ({
  tableName,
  dynamoDBEndpoint,
  basePath,
}: CreateDynamoRateLimiterProps) => {
  const dynamoClient = new AWSDynamoDBClient({ endpoint: dynamoDBEndpoint });

  return dynamoRateLimiter({
    dynamoClient,
    rateLimitProfiles,
    tableName,
    basePath,
    defaultConsumePoints: DEFAULT_CONSUME_POINTS,
    defaultRateLimitProfile: DEFAULT_RATE_LIMIT_PROFILE,
  });
};
