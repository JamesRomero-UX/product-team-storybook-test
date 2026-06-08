import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import Link from '@risksmart-app/components/src/link';
import type { AttestationCyclePartsFragment } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import { dateColumnFromConfig } from 'src/utils/table/utils/dateColumn';

import type { UseGetTablePropsOptions } from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { policyFileDetailsAttestationsUrl } from '@/utils/urls';

import type { AttestationRegisterCycleFields } from '../types';
import { useLabelledFields } from './useLabelledFields';

const useGetAllFieldConfig =
  (): TableFields<AttestationRegisterCycleFields> => {
    const { t } = useTranslation(['common'], {
      keyPrefix: 'attestations',
    });

    const { getByValue } = useRating('attestation_cycle_status');

    return useMemo(
      () => ({
        Document: {
          header: t('columns.document'),
          cell: (item) => {
            if (!item.DocumentId || !item.FileId) {
              return item.Document;
            }

            return (
              <Link
                href={policyFileDetailsAttestationsUrl(
                  item.DocumentId,
                  item.FileId
                )}
              >
                {item.Document}
              </Link>
            );
          },
        },

        Version: {
          header: t('columns.version'),
          cell: (item) => item.Version,
        },

        AttestationProgress: {
          header: t('columns.progress'),
          cell: (item) => {
            return (
              <SimpleRatingBadge
                rating={{
                  label: `${item.AttestationProgress.toString()}%`,
                  tooltip: `${item.AttestationProgress.toString()}%`,
                  color: 'charts-grey-450',
                }}
              />
            );
          },
          filterOptions: {
            filteringProperties: {
              operators: ['!=', '>', '<', '>=', '<=', '='],
            },
          },
        },

        CycleStartDate: dateColumnFromConfig({
          header: { header: t('columns.cycle_start_date') },
          dateField: 'CycleStartDate',
        }),

        CycleStatusLabelled: {
          header: t('columns.cycle_status'),
          cell: (item) => {
            const value = getByValue(item.CycleStatus);

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
      }),
      [t, getByValue]
    );
  };

const useGetAttestationCycleTableProps = (
  records: AttestationCyclePartsFragment[] | undefined
): UseGetTablePropsOptions<AttestationRegisterCycleFields> => {
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
        sortingColumn: 'Document',
        sortingDirection: 'asc',
      },
      initialColumns: [
        'Document',
        'Version',
        'AttestationProgress',
        'CycleStartDate',
        'CycleStatusLabelled',
      ],
      fields,
    }),
    [t, fields, data]
  );
};

export const useGetRegisterTableProps = (
  records: AttestationCyclePartsFragment[] | undefined
): TablePropsWithActions<AttestationRegisterCycleFields> => {
  const props = useGetAttestationCycleTableProps(records);

  return useGetTableProps(props);
};
