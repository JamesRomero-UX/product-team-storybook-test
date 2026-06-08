import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getMyDueItemsAttestationRecordsQueryConfig } from '@risksmart-app/drizzle/src/queries/attestation-record.query';

export type GetMyDueItemsAttestationRecordsResponseRow = InferQueryModel<
  'attestation_record',
  typeof getMyDueItemsAttestationRecordsQueryConfig
>;
