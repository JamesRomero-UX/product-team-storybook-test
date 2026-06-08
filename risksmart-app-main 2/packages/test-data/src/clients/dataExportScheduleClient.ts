import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { data_export_schedule } from '@risksmart-app/drizzle/src/schema';

import { getSharedDb } from './shared-db';

export const insertDataExportSchedule = async (
  input: InferInsertModel<'data_export_schedule'>
) => {
  const db = await getSharedDb();

  const [inserted] = await db.admin
    .insert(data_export_schedule)
    .values(input)
    .returning();

  return inserted;
};
