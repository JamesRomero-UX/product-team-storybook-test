import Button from '@risksmart-app/components/src/button';
import type {
  ChangeRequestPartsFragment,
  Version_Status_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PolicyDocumentStatusBadge from 'src/components/policy-document-status-badge/PolicyDocumentStatusBadge';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { Permission } from 'src/rbac/Permission';
import type { UseGetTablePropsOptions } from 'src/utils/table/hooks/useGetStatelessTableProps';
import { useGetTableProps } from 'src/utils/table/hooks/useGetTableProps';
import type { TableFields, TablePropsWithActions } from 'src/utils/table/types';

import Link from '@/components/link';
import { toLocalDate } from '@/utils/dateUtils';

export type DocumentFileTableFields = {
  version: string;
  type: string;
  status: string;
  statusValue: Version_Status_Enum;
  reviewDate?: null | string;
  reviewedBy?: null | string;
  reviewDue?: null | string;
  id: string;
  createdAtTimestamp: string;
  changeRequests: Pick<
    ChangeRequestPartsFragment,
    'ChangeRequestStatus' | 'ModifiedAtTimestamp'
  >[];
};

const useGetFieldConfig = (
  editFile: (file: DocumentFileTableFields) => void
): TableFields<DocumentFileTableFields> => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'columns',
  });

  return useMemo<TableFields<DocumentFileTableFields>>(
    () => ({
      version: {
        formId: 'document_file',
        fieldId: 'Version',
        cell: (item) => (
          <Link
            variant={'secondary'}
            href={'#'}
            onFollow={() => editFile(item)}
          >
            {item.version}
          </Link>
        ),
        sortingField: 'version',
        isRowHeader: true,
      },
      type: {
        formId: 'document_file',
        fieldId: 'Type',
      },
      status: {
        formId: 'document_file',
        fieldId: 'Status',
        cell: (item) => {
          return (
            <PolicyDocumentStatusBadge
              item={{
                Status: item.statusValue,
              }}
              changeRequests={item.changeRequests}
            />
          );
        },
      },
      reviewDate: {
        formId: 'document_file',
        fieldId: 'ReviewDate',
        cell: (item) => toLocalDate(item.reviewDate) || '-',
      },
      reviewedBy: {
        formId: 'document_file',
        fieldId: 'ReviewedBy',
      },
      reviewDue: {
        formId: 'document_file',
        fieldId: 'NextReviewDate',
        cell: (item) => toLocalDate(item.reviewDue) || '-',
      },
      createdAtTimestamp: {
        header: t('created_on'),
        cell: (item) => toLocalDate(item.createdAtTimestamp) || '-',
      },
    }),
    [editFile, t]
  );
};

const useGetVersionTableProps = (
  records: DocumentFileTableFields[] | undefined,
  onEdit: (actionUpdate: DocumentFileTableFields) => void,
  handleFileOpen: () => void,
  parent: ObjectWithContributors
): UseGetTablePropsOptions<DocumentFileTableFields> => {
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'actionUpdates',
  });
  const fields = useGetFieldConfig(onEdit);

  return useMemo<UseGetTablePropsOptions<DocumentFileTableFields>>(() => {
    return {
      data: records,
      customAttributeFormIds: [],
      entityLabel: st('entity_name'),
      emptyCollectionAction: (
        <Permission permission={'insert:document_file'} parentObject={parent}>
          <Button formAction={'none'} onClick={handleFileOpen}>
            {st('add_button')}
          </Button>
        </Permission>
      ),
      preferencesStorageKey: 'DocumentVersionTab-Preferences',
      tableId: 'documentVersionTabTable',
      enableFiltering: false,
      initialColumns: [
        'version',
        'type',
        'status',
        'reviewDate',
        'reviewedBy',
        'reviewDue',
        'createdAtTimestamp',
      ],
      fields,
      defaultSortingState: {
        sortingColumn: 'createdAtTimestamp',
        sortingDirection: 'desc',
      },
    };
  }, [fields, st, handleFileOpen, records, parent]);
};

export const useGetCollectionTableProps = (
  records: DocumentFileTableFields[] | undefined,
  onEdit: (actionUpdate: DocumentFileTableFields) => void,
  handleFileOpen: () => void,
  parent: ObjectWithContributors
): TablePropsWithActions<DocumentFileTableFields> => {
  const props = useGetVersionTableProps(
    records,
    onEdit,
    handleFileOpen,
    parent
  );

  return useGetTableProps(props);
};
