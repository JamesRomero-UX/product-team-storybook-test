import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import Link from '@risksmart-app/components/src/link';
import i18n from '@risksmart-app/i18n/src/i18n';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SimpleRatingBadge from 'src/components/simple-rating-badge';

import type { UseGetTablePropsOptions } from '@/utils/table/hooks/useGetStatelessTableProps';
import {
  type StatefulTableOptions,
  useGetStatelessTableProps,
} from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';
import { policyFileAttestationDetailsUrl } from '@/utils/urls';

import type { AttestationFlatField, AttestationRegisterFields } from './types';
import { useLabelledFields } from './useLabelledFields';

const useGetFieldConfig = (): TableFields<AttestationRegisterFields> => {
  const { t } = useTranslation(['common'], { keyPrefix: 'columns' });
  const { t: st } = useTranslation(['taxonomy']);
  const { getByValue } = useRating('attestation_record_status');

  return useMemo(
    () => ({
      User: {
        header: t('user'),
      },
      Document: {
        header: i18n.format(st('document_one'), 'capitalizeAll'),
        cell: (item) => (
          <Link
            href={policyFileAttestationDetailsUrl(
              item.node.documentFile?.parent?.Id ?? '',
              item.NodeId
            )}
          >
            {item.Document}
          </Link>
        ),
      },
      ActiveLabel: { header: 'Active' },
      AttestationStatusLabel: {
        header: t('status'),
        cell: (item) => (
          <SimpleRatingBadge rating={getByValue(item.AttestationStatus)} />
        ),
      },
      CreatedAtTimestamp: dateColumnFromConfig({
        header: { header: t('created_on') },
        dateField: 'CreatedAtTimestamp',
        includeTime: true,
      }),
      AttestedAt: dateColumnFromConfig({
        header: { header: t('attested_at') },
        dateField: 'AttestedAt',
        includeTime: true,
      }),
      ExpiresAt: dateColumnFromConfig({
        header: { header: t('expires_at') },
        dateField: 'ExpiresAt',
        includeTime: true,
      }),
      TransferredFrom: {
        header: t('transferred_from'),
        cell: (item) => item.TransferredFrom || '—',
      },
    }),
    [getByValue, t, st]
  );
};

const useGetAttestationTableProps = (
  records: AttestationFlatField[] | undefined
): UseGetTablePropsOptions<AttestationRegisterFields> => {
  const { t } = useTranslation(['common']);
  const data = useLabelledFields(records);
  const fields = useGetFieldConfig();

  return useMemo(
    () => ({
      data,
      tableId: 'attestationRegister',
      customAttributeFormIds: [],
      entityLabel: t('attestation_one'),
      emptyCollectionAction: <></>,
      preferencesStorageKey: 'AttestationRegisterTable-PreferencesV1',
      enableFiltering: true,
      defaultSortingState: {
        sortingColumn: 'Active',
        sortingDirection: 'desc',
      },
      initialColumns: [
        'User',
        'Document',
        'ActiveLabel',
        'AttestationStatusLabel',
        'AttestedAt',
        'ExpiresAt',
        'CreatedAtTimestamp',
      ],
      fields,
    }),
    [fields, t, data]
  );
};
export const useGetRegisterTableProps = (
  records: AttestationFlatField[] | undefined
): TablePropsWithActions<AttestationRegisterFields> => {
  const props = useGetAttestationTableProps(records);

  return useGetTableProps(props);
};
export const useGetAttestationSmartWidgetTableProps = (
  records: Omit<AttestationFlatField, 'carriedForwardFromRecord'>[] | undefined,
  statefulTableOptions: StatefulTableOptions<AttestationRegisterFields>
): TablePropsWithActions<AttestationRegisterFields> => {
  const props = useGetAttestationTableProps(records);

  return useGetStatelessTableProps<AttestationRegisterFields>({
    ...props,
    ...statefulTableOptions,
    enableFiltering: false,
  });
};
