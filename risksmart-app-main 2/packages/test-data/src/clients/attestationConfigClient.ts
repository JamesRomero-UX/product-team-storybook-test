import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { attestation_config } from '@risksmart-app/drizzle/src/schema';
import { eq } from 'drizzle-orm';

export const insertAttestationConfig = async (
  input: InferInsertModel<'attestation_config'>
) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });
  await db.admin.insert(attestation_config).values(input);
};

export const deleteAttestationConfigByParentId = async (parentId: string) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });
  await db.admin
    .delete(attestation_config)
    .where(eq(attestation_config.ParentId, parentId));
};
