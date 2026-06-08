import { useTranslation } from 'react-i18next';

import { useGetOwnersFieldConfig } from '@/utils/table/hooks/useGetOwnersFieldConfig';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';

import type { AttestationFlatField } from '../types';
import type { AttestationCardFields } from './types';
import { useLabelledFields } from './useLabelledFields';

const useGetFieldConfig = (): TableFields<AttestationCardFields> => {
  const { t } = useTranslation('common');
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'documentFiles.columns',
  });

  const allOwners = useGetOwnersFieldConfig<AttestationCardFields>();

  return {
    Title: {
      header: t('document_one'),
    },
    Version: {
      header: st('version'),
    },
    AttestationStatus: {
      header: st('attestationStatus'),
    },
    allOwners,
    ModifiedAtTimestamp: dateColumnFromConfig({
      header: { header: 'Updated On' },
      dateField: 'ModifiedAtTimestamp',
      includeTime: false,
    }),
  };
};

export const useGetCollectionCardProps = (
  records: AttestationFlatField[] | undefined
): TablePropsWithActions<AttestationCardFields> => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'attestations',
  });

  const data = useLabelledFields(records ?? []);

  const fields = useGetFieldConfig();

  return useGetTableProps({
    customAttributeFormIds: [],
    data: data,
    tableId: 'attestationsByUserRegister',
    entityLabel: t('entity_name'),
    emptyCollectionAction: <></>,
    preferencesStorageKey: 'AttestationsByUser-Preferences',
    enableFiltering: true,
    initialVisibleContent: ['summary', 'owners'],
    fields,
  });
};
