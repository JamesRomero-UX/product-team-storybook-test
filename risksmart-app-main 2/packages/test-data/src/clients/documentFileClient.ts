import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { document_file } from '@risksmart-app/drizzle/src/schema';

export const insertDocumentFile = async (
  input: InferInsertModel<'document_file'>
) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });
  await db.admin.insert(document_file).values(input);
};
