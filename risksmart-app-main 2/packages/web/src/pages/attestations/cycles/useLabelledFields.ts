import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import type { AttestationCyclePartsFragment } from '@risksmart-app/web-graphql-client/generated/graphql';
import { Attestation_Record_Status_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { calculateCycleStatus } from 'src/utils/attestationUtils';
import { z } from 'zod';

import { type AttestationRegisterCycleFields } from '../types';

const attestationStatusSchema = z.nativeEnum(Attestation_Record_Status_Enum);

const calculateProgress = (cycle: AttestationCyclePartsFragment): number => {
  const records = cycle.records
    .map((c) => {
      const statusString = c.attestationRecordStatus?.Status;
      if (!statusString) {
        return null;
      }

      const parsedStatus = attestationStatusSchema.safeParse(statusString);

      return {
        AttestationStatus: parsedStatus.success
          ? parsedStatus.data
          : c.AttestationStatus,
      };
    })
    .filter(
      (c): c is { AttestationStatus: Attestation_Record_Status_Enum } =>
        c !== null
    );
  const totalRecords = records.filter(
    (record) =>
      record.AttestationStatus !== Attestation_Record_Status_Enum.NotRequired
  ).length;

  const attestedRecords = records.filter(
    (record) =>
      record.AttestationStatus === Attestation_Record_Status_Enum.Attested
  ).length;

  if (totalRecords > 0) {
    return Math.round((attestedRecords / totalRecords) * 100);
  }

  return 0;
};

export const mapCyclesData = (
  cycles: AttestationCyclePartsFragment[] | undefined
):
  | Omit<AttestationRegisterCycleFields, 'CycleStatusLabelled'>[]
  | undefined => {
  if (!cycles) {
    return undefined;
  }

  return cycles.map((cycle) => {
    return {
      Document: cycle.parent.parent?.Title ?? '',
      Version: cycle.parent.Version ?? '',
      AttestationProgress: calculateProgress(cycle),
      CycleStartDate: cycle.CreatedAtTimestamp,
      CycleStatus: calculateCycleStatus(cycle),
      DocumentId: cycle.parent.parent?.Id,
      FileId: cycle.parent.Id,
    };
  });
};

export const useLabelledFields = (
  records: AttestationCyclePartsFragment[] | undefined
): AttestationRegisterCycleFields[] | undefined => {
  const cycles = useMemo(() => mapCyclesData(records), [records]);

  const { getByValue } = useRating('attestation_cycle_status');

  return cycles?.map((cycle) => ({
    ...cycle,
    CycleStatusLabelled:
      getByValue(cycle.CycleStatus)?.label || cycle.CycleStatus,
  }));
};
