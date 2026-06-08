import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useTranslation } from 'react-i18next';

import Link from '@/components/link';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import { useGetDepartmentFieldConfig } from '@/utils/table/hooks/useGetDepartmentFieldConfig';
import { useGetOwnersFieldConfig } from '@/utils/table/hooks/useGetOwnersFieldConfig';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';
import { publicPolicyFileUrl } from '@/utils/urls';

import type { DocumentFile, DocumentFileTableFields } from './types';
import { useLabelledFields } from './useLabelledFields';

const useGetFieldConfig = (): TableFields<DocumentFileTableFields> => {
  const { getByValue: getAttestationRecordStatusByValue } = useRating(
    'attestation_record_status'
  );
  const allOwners = useGetOwnersFieldConfig<DocumentFileTableFields>({
    formId: 'document',
    fieldId: 'Owners',
  });
  const departmentField = useGetDepartmentFieldConfig<DocumentFileTableFields>(
    (r) => r.departments,
    {
      formId: 'document',
      fieldId: 'departments',
    }
  );
  const { getByValue } = useRating('document_file_status');
  const { t } = useTranslation('common');
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'documentFiles.columns',
  });

  const getLink = (item: DocumentFileTableFields, label: string) => {
    return (
      <Link
        variant={'secondary'}
        href={publicPolicyFileUrl(item.ParentDocumentId)}
      >
        {label}
      </Link>
    );
  };

  return {
    Title: {
      formId: 'document',
      fieldId: 'Title',
      cell: (item) => getLink(item, item.Title),
      isRowHeader: true,
    },
    Version: {
      formId: 'document_file',
      fieldId: 'Version',
      cell: (item) => getLink(item, item.Version),
      isRowHeader: true,
    },
    TypeLabel: {
      formId: 'document_file',
      fieldId: 'Type',
    },
    StatusLabelled: {
      formId: 'document_file',
      fieldId: 'Status',
      cell: (item) => {
        return <SimpleRatingBadge rating={getByValue(item.Status)} />;
      },
    },
    AttestationStatusLabel: {
      header: st('attestationStatus'),
      cell: (item) =>
        item.AttestationStatus ? (
          <SimpleRatingBadge
            rating={getAttestationRecordStatusByValue(item.AttestationStatus)}
          />
        ) : (
          '-'
        ),
    },
    Summary: {
      formId: 'document_file',
      fieldId: 'Summary',
    },
    allOwners,
    ReviewDate: dateColumnFromConfig({
      header: {
        formId: 'document_file',
        fieldId: 'ReviewDate',
      },
      dateField: 'ReviewDate',
    }),
    ReviewDue: dateColumnFromConfig({
      header: { formId: 'document_file', fieldId: 'NextReviewDate' },
      dateField: 'ReviewDue',
    }),
    ModifiedAtTimestamp: dateColumnFromConfig({
      header: { header: st('updatedOn') },
      dateField: 'ModifiedAtTimestamp',
    }),
    departments: departmentField,
    LastPublishedDate: dateColumnFromConfig({
      header: { header: st('lastPublishedDate') },
      dateField: 'LastPublishedDate',
      onClick: undefined,
      includeTime: false,
    }),
  };
};

export const useGetCollectionTableProps = (
  records: DocumentFile[] | undefined
): TablePropsWithActions<DocumentFileTableFields> => {
  const { t: pt } = useTranslation('common', {
    keyPrefix: 'policy',
  });

  const labelledFields = useLabelledFields(records);

  const fields = useGetFieldConfig();

  return useGetTableProps({
    customAttributeFormIds: [],
    data: labelledFields,
    tableId: 'publicPolicyRegister',
    entityLabel: pt('entity_name'),
    emptyCollectionAction: <></>,
    preferencesStorageKey: 'MyPolicies-Preferences',
    enableFiltering: true,
    initialColumns: [
      'Title',
      'Version',
      'TypeLabel',
      'StatusLabelled',
      'AttestationStatusLabel',
      'Summary',
      'allOwners',
      'ReviewDate',
      'ReviewDue',
      'ModifiedAtTimestamp',
    ],
    fields,
  });
};
