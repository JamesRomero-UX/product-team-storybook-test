import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getAttestationRecordQueryConfig,
  getAttestationStatusQueryConfig,
} from '@risksmart-app/drizzle/src/queries/attestation-record.query';

export type AttestationRecordResponseRow = InferQueryModel<
  'attestation_record',
  typeof getAttestationRecordQueryConfig
>;

export type AttestationStatusResponseRow = InferQueryModel<
  'attestation_record',
  typeof getAttestationStatusQueryConfig
>;
