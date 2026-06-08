import { Logger } from '@aws-lambda-powertools/logger';

const logger = new Logger({ serviceName: 'rulebook-ingestion' });

export const getLogger = () => {
  return logger;
};
