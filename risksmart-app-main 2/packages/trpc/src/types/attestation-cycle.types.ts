import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getAttestationCycleQueryConfig } from '@risksmart-app/drizzle/src/queries/attestation-cycle.query';

export type AttestationCycleRecordResponseRow = InferQueryModel<
  'attestation_cycle',
  typeof getAttestationCycleQueryConfig
>;
