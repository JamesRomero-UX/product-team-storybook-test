import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { document } from '@risksmart-app/drizzle/src/schema';

import { getSharedDb } from './shared-db';

export const insertDocument = async (input: InferInsertModel<'document'>) => {
  const db = await getSharedDb();
  const [insertedDocument] = await db.admin
    .insert(document)
    .values(input)
    .returning();

  return insertedDocument;
};

export const insertDocuments = async (
  inputs: InferInsertModel<'document'>[]
) => {
  const db = await getSharedDb();
  const insertedDocuments = await db.admin
    .insert(document)
    .values(inputs)
    .returning();

  return insertedDocuments;
};
