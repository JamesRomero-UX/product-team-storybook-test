import {
  DisableRuleCommand,
  EventBridgeClient,
} from '@aws-sdk/client-eventbridge';
import { getLogger } from 'src/logger';

const logger = getLogger();

export const disableDataExportRule = async (
  ruleName: string
): Promise<void> => {
  const eventBridge = new EventBridgeClient({});

  try {
    await eventBridge.send(new DisableRuleCommand({ Name: ruleName }));

    logger.info('Successfully disabled EventBridge data export rule', {
      ruleName,
    });
  } catch (error) {
    logger.error(
      'Error disabling EventBridge data export rule',
      error as Error
    );
    throw error;
  }
};
