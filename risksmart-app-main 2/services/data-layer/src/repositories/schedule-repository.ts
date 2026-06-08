import type { DB } from '@risksmart-app/drizzle/src/db';
import { getLogger } from 'src/utils/logger';

const logger = getLogger();

export type ScheduleRepository = ReturnType<typeof createScheduleRepository>;

export function createScheduleRepository(db: DB['transaction']) {
  return {
    getById: async (id: string) =>
      await db(async (tx) => {
        try {
          return tx.query.schedule.findFirst({
            where: { Id: { eq: id } },
            columns: {
              Id: true,
              Frequency: true,
              ManualDueDate: true,
              StartDate: true,
              TimeToCompleteValue: true,
              TimeToCompleteUnit: true,
            },
          });
        } catch (error) {
          logger.error('Failed to get schedule by id', error as Error);
          throw error;
        }
      }),
  };
}
