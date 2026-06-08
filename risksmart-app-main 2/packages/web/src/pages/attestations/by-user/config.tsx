import Link from '@risksmart-app/components/src/link';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import type { UseGetTablePropsOptions } from 'src/utils/table/hooks/useGetStatelessTableProps';
import { useGetTableProps } from 'src/utils/table/hooks/useGetTableProps';
import type { TableFields, TablePropsWithActions } from 'src/utils/table/types';

import { attestationCardsUrl } from '@/utils/urls';

import type {
  AttestationFlatField,
  AttestationRegisterByUserFields,
} from '../types';
import { useLabelledFields } from './useLabelledFields';

const useGetFieldConfig = (): TableFields<AttestationRegisterByUserFields> => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'attestations',
  });

  return useMemo(
    () => ({
      User: {
        header: t('columns.user'),
        cell: (item) => (
          <Link href={attestationCardsUrl(item.UserId)}>{item.User}</Link>
        ),
      },
      Email: {
        header: t('columns.email'),
        cell: (item) => item.Email,
      },
      AttestationsCompleted: {
        header: t('columns.attestations_completed'),
        cell: (item) => (
          <SimpleRatingBadge
            rating={{
              label: item.AttestationsCompleted,
              tooltip: item.AttestationsCompleted,
              color: 'charts-grey-450',
            }}
          />
        ),
        filterOptions: {
          filteringProperties: {
            operators: ['!=', '>', '<', '>=', '<=', '='],
          },
        },
      },
    }),
    [t]
  );
};

export const useGetAttestationTableProps = (
  records: AttestationFlatField[] | undefined
): UseGetTablePropsOptions<AttestationRegisterByUserFields> => {
  const { t } = useTranslation(['common']);
  const data = useLabelledFields(records);
  const fields = useGetFieldConfig();

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
        sortingColumn: 'User',
        sortingDirection: 'desc',
      },
      initialColumns: ['User', 'Email', 'AttestationsCompleted'],
      fields,
    }),
    [fields, t, data]
  );
};

export const useGetRegisterTableProps = (
  records: AttestationFlatField[] | undefined
): TablePropsWithActions<AttestationRegisterByUserFields> => {
  const props = useGetAttestationTableProps(records);

  return useGetTableProps(props);
};
