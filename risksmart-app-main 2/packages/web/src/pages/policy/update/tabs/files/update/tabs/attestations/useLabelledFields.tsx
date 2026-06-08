import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useTranslation } from 'react-i18next';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { calculateAttestationStatus } from '@/utils/attestationUtils';

import type { AttestationFlatField, AttestationRegisterFields } from './types';

export const useLabelledFields = (
  records: AttestationFlatField[] | undefined
): AttestationRegisterFields[] => {
  const { getByValue } = useRating('attestation_record_status');
  const { t } = useTranslation(['common'], {
    keyPrefix: 'attestations.is_attestation_active',
  });
  const useAttestationImprovements = useIsFeatureFlagEnabled(
    'attestation_improvements'
  );

  return (
    records?.map((record) => {
      return {
        ...record,
        AttestationStatusLabel:
          getByValue(
            calculateAttestationStatus(record, { useAttestationImprovements })
          )?.label ?? '-',
        ActiveLabel: record.Active ? t('yes') : t('no'),
        User: record.user?.FriendlyName ?? record.UserId,
        Document: `${record.node.documentFile?.parent?.Title} (${record.node.documentFile?.Version})`,
        AttestationStatus: calculateAttestationStatus(record, {
          useAttestationImprovements,
        }),
        TransferredFrom:
          record.carriedForwardFromRecord?.node?.documentFile?.Version ?? '-',
      };
    }) ?? []
  );
};
