import type { AttestationCyclePartsFragment } from '@risksmart-app/web-graphql-client/generated/graphql';
import { Attestation_Record_Status_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import dayjs from 'dayjs';
import type { AttestationCycleStatus } from 'src/pages/attestations/types';
import { z } from 'zod';

const attestationStatusSchema = z.nativeEnum(Attestation_Record_Status_Enum);

export const calculateCycleStatus = (
  cycle: AttestationCyclePartsFragment
): AttestationCycleStatus => {
  const hasElapsedRecords = (
    records: AttestationCyclePartsFragment['records']
  ): boolean => {
    return records.some((record) => {
      const status = record.attestationRecordStatus?.Status;
      if (!status) {
        return false;
      }

      const parsedStatus = attestationStatusSchema.safeParse(status);
      const finalStatus = parsedStatus.success
        ? parsedStatus.data
        : record.AttestationStatus;

      return finalStatus === Attestation_Record_Status_Enum.Overdue;
    });
  };

  if (hasElapsedRecords(cycle.records) && cycle.Status === 'active') {
    return 'overdue';
  }

  return cycle.Status as 'active' | 'concluded';
};

export const calculateAttestationStatus = (
  record: {
    Active: boolean;
    ExpiresAt?: string | null;
    AttestationStatus: Attestation_Record_Status_Enum;
    attestationRecordStatus?: {
      Status?: string | null;
    } | null;
  },
  options: { useAttestationImprovements: boolean }
): Attestation_Record_Status_Enum => {
  const parsedStatus = attestationStatusSchema.safeParse(
    record?.attestationRecordStatus?.Status
  );
  const status = parsedStatus.success
    ? parsedStatus.data
    : record.AttestationStatus;

  //todo: remove the useAttestationImprovements flag and related code when the feature is fully rolled out
  if (options.useAttestationImprovements) {
    // When using improvements, the status comes from the view
    return status;
  }

  // Legacy path: use the corrected status calculation
  return getCorrectedAttestationStatus({
    ...record,
    AttestationStatus: status,
  });
};

/**
 * Return the attestation status with the expiry date taken into account
 * This is only used for the old attestation status until the improvements are fully rolled out, as the new status already takes expiry into account at the database level.
 * @param record
 * @returns
 */
const getCorrectedAttestationStatus = (record: {
  AttestationStatus: Attestation_Record_Status_Enum;
  ExpiresAt?: null | string | undefined;
}): Attestation_Record_Status_Enum =>
  dayjs(record.ExpiresAt).isBefore() &&
  record.AttestationStatus !== Attestation_Record_Status_Enum.Attested &&
  record.AttestationStatus !== Attestation_Record_Status_Enum.NotRequired
    ? Attestation_Record_Status_Enum.Expired
    : record.AttestationStatus;
