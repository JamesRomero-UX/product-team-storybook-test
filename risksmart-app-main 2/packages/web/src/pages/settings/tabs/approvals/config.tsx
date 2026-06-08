import { workflows } from '@risksmart-app/shared/approvals/workflows';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetGlobalApprovals } from 'src/hooks/queries';

import Link from '@/components/link';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import type { TableFields } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';

type ApprovalRegisterField = {
  Id: string;
  ParentType: string;
  Workflow: string;
  Levels: number;
  CreatedAtTimestamp: string;
  ModifiedAtTimestamp: string;
  CreatedByUser: null | string;
};

type OnClickEvent = (item: ApprovalRegisterField) => void;

const useAuditFields = (onClick?: OnClickEvent) => {
  const { t } = useTranslation(['common']);

  const fields: TableFields<ApprovalRegisterField> = {
    ParentType: {
      id: 'parentType',
      header: t('approvals.columns.parentType'),
      cell: (item) => item.ParentType,
    },
    Workflow: {
      id: 'workflow',
      header: t('approvals.columns.workflow'),
      cell: (item) => (
        <Link variant={'secondary'} href={'#'} onFollow={() => onClick?.(item)}>
          {item.Workflow}
        </Link>
      ),
    },
    Levels: {
      header: t('approvals.columns.levels'),
    },
    CreatedByUser: {
      header: t('columns.created_by_username'),
    },
    ModifiedAtTimestamp: dateColumnFromConfig({
      header: { header: t('columns.updated_on') },
      dateField: 'ModifiedAtTimestamp',
      includeTime: true,
    }),
    CreatedAtTimestamp: dateColumnFromConfig({
      header: { header: t('columns.created_on') },
      dateField: 'CreatedAtTimestamp',
      includeTime: true,
    }),
  };

  return fields;
};

export const useGetApprovalTableProps = (
  parent?: { Id: string },
  onClick?: OnClickEvent
) => {
  const fields = useAuditFields(onClick);
  const { data } = useGetGlobalApprovals({
    queryArgs: {
      isGlobal: !parent,
      parentId: parent?.Id ?? '00000000-0000-0000-0000-000000000000',
    },
  });

  const { t } = useTranslation(['taxonomy', 'common']);
  const parentTypeMap = t('common:objectTypes', { returnObjects: true });
  const workflowMap = t('common:approvals.workflows', { returnObjects: true });

  const labelledFields = useMemo((): ApprovalRegisterField[] => {
    if (!data) {
      return [];
    }

    return data.approval.map((approval) => {
      const parentType =
        Object.entries(workflows).find(([_, workflows]) =>
          (workflows as readonly string[]).includes(approval.Workflow)
        )?.[0] ?? '-';

      return {
        Id: approval.Id,
        ParentType: parentTypeMap[parentType as keyof typeof parentTypeMap],
        Workflow: workflowMap[approval.Workflow as keyof typeof workflowMap],
        Levels: approval.levels.length,
        CreatedByUser: approval.createdBy?.FriendlyName ?? null,
        CreatedAtTimestamp: approval.CreatedAtTimestamp,
        ModifiedAtTimestamp: approval.ModifiedAtTimestamp,
      };
    });
  }, [data, parentTypeMap, workflowMap]);

  return useGetTableProps({
    fields,
    data: labelledFields,
    entityLabel: 'approval',
    initialColumns: [
      'ParentType',
      'Workflow',
      'Levels',
      'CreatedByUser',
      'CreatedAtTimestamp',
    ],
    customAttributeFormIds: [],
    preferencesStorageKey: 'GlobalApprovalRegisterTable-PreferencesV1',
  });
};
