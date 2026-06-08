import { useMemo } from 'react';
import { getAllOwnersCellValue } from 'src/rbac/contributorHelper';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { calculateAttestationStatus } from '@/utils/attestationUtils';

import type { AttestationFlatField } from '../types';
import type { AttestationCardFields } from './types';

export const useLabelledFields = (
  records: AttestationFlatField[] | undefined
): AttestationCardFields[] | undefined => {
  const useAttestationImprovements = useIsFeatureFlagEnabled(
    'attestation_improvements'
  );

  return useMemo<AttestationCardFields[] | undefined>(
    () =>
      records?.map((record) => ({
        Id: record.Id,
        AttestationStatus: calculateAttestationStatus(record, {
          useAttestationImprovements,
        }),
        ParentDocumentId: record.node.documentFile?.parent?.Id ?? '-',
        FileId: record.node.documentFile?.Id ?? '-',
        Title: record.node.documentFile?.parent?.Title ?? '-',
        ModifiedAtTimestamp: record.ModifiedAtTimestamp,
        Version: record.node.documentFile?.Version ?? '-',
        allOwners: getAllOwnersCellValue({
          owners: record.node.documentFile?.parent?.owners ?? [],
          ownerGroups: record.node.documentFile?.parent?.ownerGroups ?? [],
        }),
        User: {
          FirstName: record.user.FirstName ?? '-',
          LastName: record.user.LastName ?? '-',
        },
      })),
    [records, useAttestationImprovements]
  );
};
