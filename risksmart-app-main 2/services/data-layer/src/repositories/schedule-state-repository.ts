import type { DB } from '@risksmart-app/drizzle/src/db';
import { schedule_state } from '@risksmart-app/drizzle/src/schema';
import { sql } from 'drizzle-orm';
import type { ServiceContext } from 'src/types';
import { getLogger } from 'src/utils/logger';

const logger = getLogger();

export type ScheduleStateRepository = ReturnType<
  typeof createScheduleStateRepository
>;

export function createScheduleStateRepository(db: DB['transaction']) {
  return {
    getById: async (id: string) =>
      await db(async (tx) => {
        try {
          return tx.query.schedule_state.findFirst({
            where: { Id: { eq: id } },
            columns: {
              Id: true,
              LatestDate: true,
              DueDate: true,
              OverdueDate: true,
            },
          });
        } catch (error) {
          logger.error('Failed to get schedule state by id', error as Error);
          throw error;
        }
      }),

    upsert: async (
      id: string,
      data: {
        LatestDate?: string | null;
        DueDate?: string | null;
        OverdueDate?: string | null;
      },
      context: ServiceContext
    ) =>
      await db(async (tx) => {
        try {
          const latestDate = data.LatestDate ?? null;
          const dueDate = data.DueDate ?? null;
          const overdueDate = data.OverdueDate ?? null;

          const [result] = await tx
            .insert(schedule_state)
            .values({
              Id: id,
              DueDate: dueDate,
              OverdueDate: overdueDate,
              LatestDate: latestDate,
              OrgKey: context.orgKey,
              CreatedByUser: 'SYSTEM',
              ModifiedByUser: 'SYSTEM',
              ModifiedAtTimestamp: sql`statement_timestamp()`,
              CreatedAtTimestamp: sql`statement_timestamp()`,
            })
            .onConflictDoUpdate({
              target: schedule_state.Id,
              set: {
                DueDate: dueDate,
                OverdueDate: overdueDate,
                LatestDate: latestDate,
                ModifiedByUser: 'SYSTEM',
                ModifiedAtTimestamp: sql`statement_timestamp()`,
              },
            })
            .returning();

          return result!;
        } catch (error) {
          logger.error('Failed to upsert schedule state', error as Error);
          throw error;
        }
      }),
  };
}
