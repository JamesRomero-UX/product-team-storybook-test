import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { attestation_record } from '@risksmart-app/drizzle/src/schema';
import { eq } from 'drizzle-orm';

export const insertAttestationRecord = async (
  input: InferInsertModel<'attestation_record'>
) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });
  await db.admin.insert(attestation_record).values(input);
};

export const deleteAttestationRecordById = async (id: string) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });
  await db.admin
    .delete(attestation_record)
    .where(eq(attestation_record.Id, id));
};
