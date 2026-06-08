import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import Link from '@risksmart-app/components/src/link';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import { dateColumnFromConfig } from 'src/utils/table/utils/dateColumn';

import type { UseGetTablePropsOptions } from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { attestationCardsUrl, policyFileDetailsUrl } from '@/utils/urls';

import type {
  AttestationFlatField,
  AttestationRegisterAllFields,
} from '../types';
import { useLabelledFields } from './useLabelledFields';

const useGetAllFieldConfig = (): TableFields<AttestationRegisterAllFields> => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'attestations',
  });

  const { getByValue } = useRating('attestation_record_status');

  return useMemo(
    () => ({
      Name: {
        header: t('columns.name'),
        cell: (item) => (
          <Link href={attestationCardsUrl(item.UserId)}>{item.Name}</Link>
        ),
      },
      Document: {
        header: t('columns.document'),
        cell: (item) => {
          if (!item.DocumentId || !item.FileId) {
            return item.Document;
          }

          return (
            <Link href={policyFileDetailsUrl(item.DocumentId, item.FileId)}>
              {item.Document}
            </Link>
          );
        },
      },
      Version: {
        header: t('columns.version'),
        cell: (item) => item.Version,
      },
      TransferredFrom: {
        header: t('columns.transferred_from'),
        cell: (item) => item.TransferredFrom || '-',
      },
      AttestationStatusLabelled: {
        header: t('columns.attestation_status'),
        cell: (item) => {
          const value = getByValue(item.AttestationStatus);

          return (
            <SimpleRatingBadge
              rating={{
                label: value?.label ?? '-',
                color: value?.color,
              }}
            />
          );
        },
      },
      CycleStartDate: dateColumnFromConfig({
        header: { header: t('columns.cycle_start_date') },
        dateField: 'CycleStartDate',
      }),

      CycleEndDate: dateColumnFromConfig({
        header: { header: t('columns.cycle_end_date') },
        dateField: 'CycleEndDate',
      }),

      UserDueDate: dateColumnFromConfig({
        header: { header: t('columns.user_due_date') },
        dateField: 'UserDueDate',
      }),

      UserAttestedAt: dateColumnFromConfig({
        header: { header: t('columns.user_attested_at') },
        dateField: 'UserAttestedAt',
      }),
    }),
    [t, getByValue]
  );
};

const useGetAttestationTableProps = (
  records: AttestationFlatField[] | undefined
): UseGetTablePropsOptions<AttestationRegisterAllFields> => {
  const { t } = useTranslation(['common']);

  const data = useLabelledFields(records);
  const fields = useGetAllFieldConfig();

  return useMemo(
    () => ({
      data,
      customAttributeFormIds: [],
      tableId: 'attestationRegister',
      customAttributeSchema: [],
      entityLabel: t('attestation_one'),
      emptyCollectionAction: <></>,
      preferencesStorageKey: 'AttestationRegisterTable-PreferencesV1',
      enableFiltering: true,
      defaultSortingState: {
        sortingColumn: 'Name',
        sortingDirection: 'asc',
      },
      initialColumns: [
        'Name',
        'Document',
        'Version',
        'AttestationStatusLabelled',
        'CycleStartDate',
        'UserDueDate',
        'UserAttestedAt',
      ],
      fields,
    }),
    [t, fields, data]
  );
};

export const useGetRegisterTableProps = (
  records: AttestationFlatField[] | undefined
): TablePropsWithActions<AttestationRegisterAllFields> => {
  const props = useGetAttestationTableProps(records);

  return useGetTableProps(props);
};
