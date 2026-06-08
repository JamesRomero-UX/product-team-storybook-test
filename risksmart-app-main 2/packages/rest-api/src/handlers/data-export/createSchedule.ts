import dayjs from 'dayjs';
import {
  DataExportScheduleStatusEnum,
  DataExportScheduleStorageTypeEnum,
} from 'generated/graphql';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getLogger } from 'src/logger';
import { getBackendRestApiClient } from 'src/repositories/getBackendRestApiClient';

import { getSessionData } from '../../session';
import { storeSecret } from './helpers/storeSecret';
import { CreateScheduleSchema } from './schema';

const logger = getLogger();

export const handler = backendRouteHandler(
  CreateScheduleSchema,
  async (body) => {
    logger.info('Start creating data export schedule', JSON.stringify(body));
    const { tenant, orgKey } = getSessionData(body.session_variables);
    const inputObject = body.input.object;

    const HTTP_STATUS = {
      ok: 200,
      not_acceptable: 406,
      server_error: 500,
    };

    if (
      inputObject.storageType !==
        DataExportScheduleStorageTypeEnum.MsSharePoint &&
      inputObject.storageType !== DataExportScheduleStorageTypeEnum.Sftp
    ) {
      return {
        statusCode: HTTP_STATUS.not_acceptable,
        body: JSON.stringify({
          message: 'Unsupported storage type',
        }),
      };
    }

    let secretARN;
    try {
      secretARN = await storeSecret({
        tenant,
        orgKey,
        inputObject,
      });
    } catch (_) {
      return {
        statusCode: HTTP_STATUS.server_error,
        body: JSON.stringify({
          message:
            'Failed to create data export schedule: could not store credentials',
        }),
      };
    }

    try {
      const sessionData = getSessionData(body.session_variables);
      const riskSmartApiClient = getBackendRestApiClient(sessionData);
      const commonFields = {
        Frequency: inputObject.frequency,
        StartTimestamp: inputObject.startDate
          ? dayjs(inputObject.startDate).utc().startOf('day').toISOString()
          : dayjs().utc().startOf('day').toISOString(),
        ...(inputObject.endDate && { EndTimestamp: inputObject.endDate }),
        StorageType: inputObject.storageType,
        Status: DataExportScheduleStatusEnum.Inactive, // Will be set to active after the cron job is created
      };

      const { insert_data_export_schedule_one: insertResponse } =
        await riskSmartApiClient.insertDataExportSchedule({
          ...commonFields,
          SecretArn: secretARN,
        });

      return {
        statusCode: HTTP_STATUS.ok,
        body: JSON.stringify({
          message: 'Successfully created data export schedule',
          scheduleId: insertResponse?.Id,
        }),
      };
    } catch (error) {
      logger.error('Failed to insert data export schedule', error as Error);

      return {
        statusCode: HTTP_STATUS.server_error,
        body: JSON.stringify({
          message: 'Failed to create data export schedule',
        }),
      };
    }
  }
);
