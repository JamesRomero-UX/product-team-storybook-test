import { Attestation_Record_Status_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { z } from 'zod';

import type {
  AttestationFlatField,
  AttestationRegisterByUserFields,
} from '../types';

const attestationStatusSchema = z.nativeEnum(Attestation_Record_Status_Enum);

const calculateCompletionPercentage = (
  records: AttestationFlatField[]
): { required: number; percentageComplete: number } => {
  // disregard old attestation versions
  const activeAttestations = records.filter((record) => record.Active);

  // outstanding = pending, not attested or overdue
  const outstandingAttestations = activeAttestations.filter((record) => {
    const statusString = record.attestationRecordStatus?.Status;
    if (!statusString) {
      return false;
    }
    const parsedStatus = attestationStatusSchema.safeParse(statusString);
    const status = parsedStatus.success
      ? parsedStatus.data
      : record.AttestationStatus;

    return (
      status === Attestation_Record_Status_Enum.Pending ||
      status === Attestation_Record_Status_Enum.NotAttested ||
      status === Attestation_Record_Status_Enum.Overdue
    );
  });

  const completed = activeAttestations.length - outstandingAttestations.length;
  const percent =
    activeAttestations.length === 0
      ? 0
      : (completed / activeAttestations.length) * 100;

  return {
    required: activeAttestations.length,
    percentageComplete: Math.round(percent),
  };
};

export const useLabelledFields = (
  records: AttestationFlatField[] | undefined
): AttestationRegisterByUserFields[] | undefined => {
  const attestationsByUser: Record<string, AttestationFlatField[]> | undefined =
    records?.reduce(
      (acc, record) => {
        if (!acc[record.UserId]) {
          acc[record.UserId] = [];
        }
        acc[record.UserId].push(record);

        return acc;
      },
      {} as Record<string, AttestationFlatField[]>
    );

  if (!attestationsByUser) {
    return [];
  }

  return Object.values(attestationsByUser).map((attestations) => {
    const firstRecord = attestations[0];
    const completion = calculateCompletionPercentage(attestations) ?? undefined;

    return {
      UserId: firstRecord.UserId,
      User: firstRecord.user?.FriendlyName ?? '-',
      Email: firstRecord.user?.Email ?? '-',
      AttestationsCompleted:
        completion.required > 0
          ? `${completion.percentageComplete.toString()}%`
          : 'N/A',
    };
  });
};
