import Button from '@risksmart-app/components/src/button';
import type { GetIssueUpdatesByParentIssueIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MAX_COL_WIDTH } from 'src/App.config';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { Permission } from 'src/rbac/Permission';
import type { UseGetTablePropsOptions } from 'src/utils/table/hooks/useGetStatelessTableProps';
import { useGetTableProps } from 'src/utils/table/hooks/useGetTableProps';
import type { TableFields, TablePropsWithActions } from 'src/utils/table/types';

import Link from '@/components/link';
import { toLocalDate } from '@/utils/dateUtils';

type IssueUpdateFields = GetIssueUpdatesByParentIssueIdQuery['issue_update'][0];

export type IssueUpdateTableFields = IssueUpdateFields & {
  CreatedByUserName: null | string;
};

const useGetFieldConfig = (
  onEdit: (issueUpdate: IssueUpdateTableFields) => void
): TableFields<IssueUpdateTableFields> => {
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'actionUpdates.columns',
  });
  const { t } = useTranslation(['common'], {
    keyPrefix: 'columns',
  });

  return useMemo(
    () => ({
      Title: {
        formId: 'issue_update',
        fieldId: 'Title',
        cell: (item) => (
          <Link variant={'secondary'} href={'#'} onFollow={() => onEdit(item)}>
            {item.Title}
          </Link>
        ),
        sortingField: 'Title',
        maxWidth: MAX_COL_WIDTH,
        isRowHeader: true,
      },
      Description: {
        formId: 'issue_update',
        fieldId: 'Description',
        cell: (item) => item.Description,
        sortingField: 'Description',
        maxWidth: MAX_COL_WIDTH,
      },
      CreatedByUserName: {
        id: 'createdBy',
        header: t('created_by_username'),
        cell: (item) => item.CreatedByUserName || '-',
        sortingField: 'CreatedByUserName',
      },
      CreatedAtTimestamp: {
        id: 'date',
        header: st('date'),
        cell: (item) =>
          item.CreatedAtTimestamp ? toLocalDate(item.CreatedAtTimestamp) : '-',
        sortingField: 'CreatedAtTimestamp',
      },
    }),
    [onEdit, t, st]
  );
};

const useGetIssueUpdateTableProps = (
  records: IssueUpdateTableFields[] | undefined,
  onEdit: (issueUpdate: IssueUpdateTableFields) => void,
  handleIssueUpdateModalOpen: () => void,
  parent: ObjectWithContributors
): UseGetTablePropsOptions<IssueUpdateTableFields> => {
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'actionUpdates',
  });
  const fields = useGetFieldConfig(onEdit);

  return useMemo<UseGetTablePropsOptions<IssueUpdateTableFields>>(() => {
    return {
      data: records,
      customAttributeFormIds: [],
      entityLabel: st('entity_name'),
      emptyCollectionAction: (
        <Permission permission={'insert:issue_update'} parentObject={parent}>
          <Button formAction={'none'} onClick={handleIssueUpdateModalOpen}>
            {st('add_button')}
          </Button>
        </Permission>
      ),
      preferencesStorageKey: 'IssueUpdateTab-Preferences',
      tableId: 'issueUpdateTabTable',
      enableFiltering: false,
      initialColumns: [
        'Title',
        'Description',
        'CreatedByUserName',
        'CreatedAtTimestamp',
      ],
      fields,
      defaultSortingState: {
        sortingColumn: 'CreatedAtTimestamp',
        sortingDirection: 'desc',
      },
    };
  }, [fields, st, handleIssueUpdateModalOpen, records, parent]);
};

export const useGetCollectionTableProps = (
  records: IssueUpdateTableFields[] | undefined,
  onEdit: (issueUpdate: IssueUpdateTableFields) => void,
  handleIssueUpdateModalOpen: () => void,
  parent: ObjectWithContributors
): TablePropsWithActions<IssueUpdateTableFields> => {
  const props = useGetIssueUpdateTableProps(
    records,
    onEdit,
    handleIssueUpdateModalOpen,
    parent
  );

  return useGetTableProps(props);
};
