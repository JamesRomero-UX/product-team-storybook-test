import type { Logger } from '@aws-lambda-powertools/logger';
import type { PermitSDK } from '@risksmart-app/permitio/types';

export const pollForResourceInstance = async (
  logger: Logger,
  permit: PermitSDK,
  resourceType: string,
  key: string,
  orgKey: string,
  attempts: number = 45
) => {
  for (let i = 0; i < attempts; i++) {
    logger.info('Checking if resource instance exists', {
      key,
      resourceType,
      orgKey: orgKey,
    });

    const resourceExists = await permit.resourceInstanceExists(
      key,
      resourceType,
      orgKey
    );

    if (resourceExists) {
      logger.info('Found existing resources. Ending search', {
        key,
        resourceType,
        orgKey: orgKey,
      });

      return true;
    } else {
      logger.info('Resource instance. not found Retrying in 300ms', {
        attempt: i,
      });
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  return false;
};
