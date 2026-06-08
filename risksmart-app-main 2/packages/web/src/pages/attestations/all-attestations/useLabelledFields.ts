import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';
import { calculateAttestationStatus } from 'src/utils/attestationUtils';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

import type {
  AttestationFlatField,
  AttestationRegisterAllFields,
} from '../types';

export const useLabelledFields = (
  records: AttestationFlatField[] | undefined
): AttestationRegisterAllFields[] | undefined => {
  const { getByValue } = useRating('attestation_record_status');

  const useAttestationImprovements = useIsFeatureFlagEnabled(
    'attestation_improvements'
  );

  return useMemo<AttestationRegisterAllFields[] | undefined>(() => {
    return records?.map((record) => ({
      UserId: record.UserId,
      Name: record.user?.FriendlyName ?? record.UserId,
      Document: record.node.documentFile?.parent?.Title ?? '',
      Version: record.node.documentFile?.Version ?? '',
      TransferredFrom:
        record.carriedForwardFromRecord?.node.documentFile?.Version ?? '',
      AttestationStatus: calculateAttestationStatus(record, {
        useAttestationImprovements,
      }),
      AttestationStatusLabelled: getByValue(
        calculateAttestationStatus(record, { useAttestationImprovements })
      )?.label,
      CycleStartDate: record.CreatedAtTimestamp ?? '',
      CycleEndDate: '',
      UserDueDate: record.ExpiresAt ?? '',
      UserAttestedAt: record.AttestedAt ?? '-',
      DocumentId: record.node.documentFile?.parent?.Id,
      FileId: record.node.documentFile?.Id,
    }));
  }, [records, getByValue, useAttestationImprovements]);
};
