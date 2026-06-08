import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { control_group } from '@risksmart-app/drizzle/src/schema';
import { eq } from 'drizzle-orm';

export const insertControlGroup = async (
  input: InferInsertModel<'control_group'>
) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });

  const [insertedControlGroup] = await db.admin
    .insert(control_group)
    .values(input)
    .returning();

  return insertedControlGroup;
};

export const getControlGroupById = async (id: string) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });

  const controlGroup = await db.admin
    .select()
    .from(control_group)
    .where(eq(control_group.Id, id))
    .limit(1);

  return controlGroup[0];
};
