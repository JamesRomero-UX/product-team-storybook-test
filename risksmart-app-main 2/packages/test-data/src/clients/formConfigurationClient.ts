import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { form_configuration } from '@risksmart-app/drizzle/src/schema';

export const insertFormConfiguration = async (
  input: InferInsertModel<'form_configuration'>
) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });
  const [result] = await db.admin
    .insert(form_configuration)
    .values(input)
    .returning();

  return result;
};
