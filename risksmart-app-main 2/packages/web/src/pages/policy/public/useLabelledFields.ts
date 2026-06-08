import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import _ from 'lodash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { calculateAttestationStatus } from '@/utils/attestationUtils';
import { getAllOwnersCellValue } from 'src/rbac/contributorHelper';

import type { DocumentFile, DocumentFileTableFields } from './types';
import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

export const useLabelledFields = (
  records: DocumentFile[] | undefined
): DocumentFileTableFields[] | undefined => {
  const { t: pt } = useTranslation('common', {
    keyPrefix: 'policy',
  });
  const documentTypes = pt('types', { returnObjects: true });
  const { getLabel: getDocumentFileStatusLabel } = useRating(
    'document_file_status'
  );
  const { getByValue: getAttestationRecordStatusByValue } = useRating(
    'attestation_record_status'
  );
  const useAttestationImprovements = useIsFeatureFlagEnabled(
    'attestation_improvements'
  );

  return useMemo<DocumentFileTableFields[] | undefined>(
    () =>
      records?.map((d) => {
        const attestation: DocumentFile['attestations'][number] | undefined =
          d.attestations.length > 0 ? d.attestations?.[0] : undefined;
        const attestationStatus = attestation
          ? calculateAttestationStatus(attestation, {
              useAttestationImprovements,
            })
          : undefined;

        return {
          ModifiedAtTimestamp: d.ModifiedAtTimestamp,
          Id: d.Id,
          Type: d.Type,
          TypeLabel:
            documentTypes[d.parent?.DocumentType as keyof typeof documentTypes],
          Title: d.parent?.Title || '-',
          Status: d.Status ?? '',
          StatusLabelled: getDocumentFileStatusLabel(d.Status ?? ''),
          ReviewDue: d.NextReviewDate || '-',
          ReviewDate: d.ReviewDate || '-',
          FileId: d.file?.Id,
          Link: d.Link,
          Version: d.Version,
          Summary: d.Summary || '-',
          ParentDocumentId: d.ParentDocumentId,
          allOwners: getAllOwnersCellValue(d.parent!),
          AttestationStatusLabel: attestation
            ? (getAttestationRecordStatusByValue(attestationStatus)?.label ??
              '-')
            : '-',
          AttestationStatus: attestationStatus,
          departments: d.parent?.departments ?? [],
          LastPublishedDate: d.PublishedDate || '-',
        };
      }),
    [
      records,
      documentTypes,
      getDocumentFileStatusLabel,
      getAttestationRecordStatusByValue,
    ]
  );
};
