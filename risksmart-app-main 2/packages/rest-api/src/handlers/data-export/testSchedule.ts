import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getLogger } from 'src/logger';
import {
  buildTestScheduleCommandHandler,
  DataExportScheduleNotFoundError,
} from 'src/services/data-export';
import { getSessionData } from 'src/session';

import { TestScheduleSchema } from './schema';

const logger = getLogger();

export const handler = backendRouteHandler(TestScheduleSchema, async (body) => {
  logger.info('Start testing data export schedule');
  const inputObject = body.input.object;

  try {
    const sessionData = getSessionData(body.session_variables);
    const commandHandler = buildTestScheduleCommandHandler(sessionData);

    await commandHandler.execute({
      scheduleId: inputObject.scheduleId,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Successfully initiated data export schedule test',
      }),
    };
  } catch (error) {
    logger.error(
      'Failed to initiate data export schedule test',
      error as Error
    );

    const errorMessage = (error as Error).message;

    if (error instanceof DataExportScheduleNotFoundError) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: errorMessage,
        }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to initiate data export schedule test',
      }),
    };
  }
});
