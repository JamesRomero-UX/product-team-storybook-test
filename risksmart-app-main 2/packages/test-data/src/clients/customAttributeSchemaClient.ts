import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { custom_attribute_schema } from '@risksmart-app/drizzle/src/schema';

export const insertCustomAttributeSchema = async (
  input: InferInsertModel<'custom_attribute_schema'>
) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });
  const [result] = await db.admin
    .insert(custom_attribute_schema)
    .values(input)
    .returning();

  return result;
};
