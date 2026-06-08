import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { data_export_schedule_execution } from '@risksmart-app/drizzle/src/schema';

import { getSharedDb } from './shared-db';

export const insertDataExportScheduleExecution = async (
  input: InferInsertModel<'data_export_schedule_execution'>
) => {
  const db = await getSharedDb();

  const [inserted] = await db.admin
    .insert(data_export_schedule_execution)
    .values(input)
    .returning();

  return inserted;
};
