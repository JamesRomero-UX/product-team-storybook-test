import { Logger } from '@aws-lambda-powertools/logger';

const logger = new Logger({ serviceName: 'tenant-configuration' });

export const getLogger = () => {
  return logger;
};
