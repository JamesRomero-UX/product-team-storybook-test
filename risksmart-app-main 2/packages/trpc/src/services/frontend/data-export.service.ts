import { DataExportStatus } from '@risksmart-app/domain/src/types/consts/index';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { getDataExportScheduleExecutionsQueryConfig } from '@risksmart-app/drizzle/src/queries/data-export-schedule-execution.query';
import { bulkCheck } from '@risksmart-app/permitio/src/permit';

import type { DataExportService, ServiceContext } from '../service.types';

export class DataExportServiceImpl implements DataExportService {
  async getActiveSchedule(ctx: ServiceContext) {
    const result = await bulkCheck(
      [
        {
          resourceName: `data_export`,
          action: 'read',
        },
      ],
      ctx.userId,
      ctx.orgId
    );

    if (!result || result.length === 0) {
      return [];
    }

    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) =>
      tx.query.data_export_schedule.findMany({
        where: {
          Status: DataExportStatus.Active,
        },
        orderBy: (t, { desc }) => [desc(t.CreatedAtTimestamp)],
        limit: 1,
      })
    );

    return data;
  }
  async getScheduleExecutions(ctx: ServiceContext) {
    const result = await bulkCheck(
      [
        {
          resourceName: `data_export`,
          action: 'read',
        },
      ],
      ctx.userId,
      ctx.orgId
    );

    if (!result || result.length === 0) {
      return [];
    }

    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) =>
      tx.query.data_export_schedule_execution.findMany({
        ...getDataExportScheduleExecutionsQueryConfig,
      })
    );

    return data;
  }
}
