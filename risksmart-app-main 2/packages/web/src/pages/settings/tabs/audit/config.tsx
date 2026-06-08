import { useLazyQuery, useQuery } from '@apollo/client';
import type {
  Audit_Log_View_Bool_Exp,
  Audit_Log_View_Order_By,
  GetAuditLogsQuery,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  GetAuditLogsDocument,
  GetUsersDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useTranslation } from 'react-i18next';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';
import { notEmpty } from 'src/utilityTypes';

import type { CollectionData } from '@/utils/collectionUtils';
import { useGetLazyTableProps } from '@/utils/table/hooks/useGetLazyTableProps';
import type { LazyDataset, TableFields } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';
import { translatedExactFilterOperators } from '@/utils/table/utils/filterUtils';

import type { AuditEntityRetrieverInput } from './types';

type AuditLogFields = CollectionData<
  GetAuditLogsQuery['audit_log_view'][number]
>;

export type AuditLogRegisterFields = Omit<AuditLogFields, 'PerformedByUser'> & {
  Id: string;
  PerformedByUser: string;
  RawObjectType: string;
};

const snakeToTitleCase = (snakeStr: string): string => {
  return snakeStr
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const useAuditFields = (
  handleAuditEntityClick: (data: AuditEntityRetrieverInput) => void
) => {
  const { t } = useTranslation(['common']);
  const { data: users } = useQuery(GetUsersDocument);
  const {
    hasPermission: canViewAuditEntities,
    loading: canViewAuditEntitiesLoading,
  } = useHasPermissionQuery('read:audit');
  const auditLogTypes = t('objectTypes');
  const auditLogActions = t('auditLog.auditLogActions');

  const objectTypeFilteringOptions = Object.entries(auditLogTypes).map(
    ([value, label]) => ({ value, label })
  );

  const actionFilteringOptions = Object.entries(auditLogActions).map(
    ([value, label]) => ({ value, label })
  );

  const fields: TableFields<AuditLogRegisterFields> = {
    ObjectType: {
      header: t('columns.type'),
      sortingDisabled: true,
      filterOptions: {
        filteringProperties: {
          operators: translatedExactFilterOperators(objectTypeFilteringOptions),
        },
        filteringOptions: objectTypeFilteringOptions,
      },
      cell: (c) =>
        canViewAuditEntities && !canViewAuditEntitiesLoading ? (
          <span
            className={'p-3 text-center cursor-pointer'}
            role={'button'}
            onClick={async () => {
              handleAuditEntityClick({
                entityType: c.RawObjectType,
                id: c.Id,
                operation: c.Action as 'Added' | 'Deleted' | 'Updated',
                operationDate: c.ModifiedAtTimestamp!,
              });
            }}
          >
            {c.ObjectType}
          </span>
        ) : (
          <span>{c.ObjectType}</span>
        ),
    },
    Action: {
      header: t('columns.action'),
      sortingDisabled: true,
      filterOptions: {
        filteringProperties: {
          operators: translatedExactFilterOperators(actionFilteringOptions),
        },
        filteringOptions: actionFilteringOptions,
      },
    },
    Item: {
      header: t('columns.item'),
    },
    Id: {
      header: t('columns.id'),
    },
    PerformedByUser: {
      header: t('columns.action_performed_by'),
      sortingField: 'PerformedByUser.FriendlyName',
      filterOptions: {
        filteringProperties: { key: 'PerformedByUser.FriendlyName' },
        filteringOptions: users?.user
          .map((u) => u.FriendlyName)
          .filter(notEmpty)
          .map((friendlyName) => ({
            value: friendlyName,
            label: friendlyName,
          })),
      },
    },
    ModifiedAtTimestamp: dateColumnFromConfig({
      header: { header: t('columns.datetime') },
      dateField: 'ModifiedAtTimestamp',
      includeTime: true,
    }),
  };

  return fields;
};

export const useGetAuditTableProps = (
  handleAuditEntityClick: (data: AuditEntityRetrieverInput) => void
) => {
  const fields = useAuditFields(handleAuditEntityClick);
  const { t } = useTranslation(['taxonomy', 'common']);
  const actionFieldMapping = t('common:auditLog.auditLogActions', {
    returnObjects: true,
  });
  const objectTypeMapping = t('common:objectTypes', {
    returnObjects: true,
  });
  const [getAuditLogs] = useLazyQuery(GetAuditLogsDocument);

  const fetchAuditLogs: LazyDataset<AuditLogRegisterFields> = async ({
    limit,
    offset,
    orderBy,
    where,
  }) => {
    const { data } = await getAuditLogs({
      variables: {
        limit,
        offset,
        where: where as Audit_Log_View_Bool_Exp,
        orderBy: orderBy as unknown as Audit_Log_View_Order_By[],
      },
    });

    const getTranslatedObjectType = (string: null | string | undefined) => {
      return string !== null
        ? (objectTypeMapping?.[string as keyof typeof objectTypeMapping] ??
            snakeToTitleCase(string ?? ''))
        : 'Unknown';
    };

    const getItemField = (item: AuditLogFields) => {
      if (item.ObjectType === 'form_configuration') {
        return getTranslatedObjectType(item.Item);
      } else {
        return item.Item ?? '-';
      }
    };

    const mappedData =
      data?.audit_log_view.map(
        (d) =>
          ({
            ...d,
            Action:
              actionFieldMapping?.[
                d.Action as keyof typeof actionFieldMapping
              ] ?? '',
            ObjectType: getTranslatedObjectType(d.ObjectType),
            PerformedByUser: d.PerformedByUser?.FriendlyName ?? 'System',
            Id: d.Id ?? '-',
            Item: getItemField(d),
            RawObjectType: d.ObjectType as Parent_Type_Enum,
          }) satisfies AuditLogRegisterFields
      ) ?? [];

    return {
      data: mappedData,
    };
  };

  return useGetLazyTableProps({
    customAttributeFormIds: [],
    data: fetchAuditLogs,
    entityLabel: 'audit_log',
    emptyCollectionAction: <></>,
    preferencesStorageKey: 'AuditLogRegisterTable-PreferencesV2',
    enableFiltering: true,
    initialColumns: [
      'ObjectType',
      'Action',
      'Item',
      'Id',
      'PerformedByUser',
      'ModifiedAtTimestamp',
    ],
    fields,
    defaultSortingState: {
      sortingColumn: 'ModifiedAtTimestamp',
      sortingDirection: 'desc',
    },
  });
};
