import type { PropertyFilterOperator } from '@cloudscape-design/collection-hooks';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import type { GetChangeRequestsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import BadgeList from 'src/components/badge-list';
import SimpleRatingBadge from 'src/components/simple-rating-badge';

import Link from '@/components/link';
import useEntityInfo from '@/hooks/getEntityInfo';
import { getFriendlyId } from '@/utils/friendlyId';
import { useGetApproversFieldConfig } from '@/utils/table/hooks/useGetApproversFieldConfig';
import { useGetCurrentApproversFieldConfig } from '@/utils/table/hooks/useGetCurrentApproversFieldConfig';
import { useGetNextApproversFieldConfig } from '@/utils/table/hooks/useGetNextApproversFieldConfig';
import { useGetParentOwnersFieldConfig } from '@/utils/table/hooks/useGetParentOwnersFieldConfig';
import { useGetRequestersFieldConfig } from '@/utils/table/hooks/useGetRequestersFieldConfig';
import type {
  StatefulTableOptions,
  UseGetTablePropsOptions,
} from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetStatelessTableProps } from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';
import { policyFileDetailsUrl } from '@/utils/urls';

import type { ChangeRequestRegisterFields } from './types';
import { useLabelledFields } from './useLabelledFields';

export const useGetChangeRequestParentUrl = () => {
  const getEntityInfo = useEntityInfo();
  const getParentUrl = (changeRequest: {
    parent?: {
      Id: string;
      ObjectType?: Parent_Type_Enum | null;
      documentFile?: { parent?: { Id: string } | null } | null;
      issue_assessment?: { parent?: { Id: string } | null } | null;
    } | null;
  }) => {
    let url = '';
    if (changeRequest.parent?.ObjectType) {
      if (changeRequest.parent.ObjectType === 'document_file') {
        if (changeRequest.parent.documentFile?.parent) {
          url = policyFileDetailsUrl(
            changeRequest.parent.documentFile.parent.Id,
            changeRequest.parent.Id
          );
        }
      } else if (changeRequest.parent.ObjectType === 'issue_assessment') {
        const entityInfo = getEntityInfo(changeRequest.parent.ObjectType);
        url = entityInfo.url(
          changeRequest.parent.issue_assessment?.parent?.Id ?? '#'
        );
      } else {
        const entityInfo = getEntityInfo(changeRequest.parent.ObjectType);
        url = entityInfo.url(changeRequest.parent.Id);
      }
    }

    return url;
  };

  return getParentUrl;
};

const useGotoChangeRequestParentUrl = () => {
  const navigate = useNavigate();
  const getParentUrl = useGetChangeRequestParentUrl();
  const gotoParentUrl = async (changeRequest: ChangeRequestRegisterFields) => {
    navigate(
      `${getParentUrl(changeRequest)}?showRequest=true&requestId=${changeRequest.Id}`
    );
  };

  return gotoParentUrl;
};

const useRequestsFields = () => {
  const { t } = useTranslation(['common']);
  const { getByValue } = useRating('approval_status');
  const gotoParentUrl = useGotoChangeRequestParentUrl();
  const approversField = useGetApproversFieldConfig();
  const requestersField = useGetRequestersFieldConfig();
  const currentApproversField = useGetCurrentApproversFieldConfig();
  const nextApproversField = useGetNextApproversFieldConfig();
  const parentOwnersField = useGetParentOwnersFieldConfig();

  const fields: TableFields<ChangeRequestRegisterFields> = {
    SequentialId: {
      id: 'sequentialId',
      header: t('columns.id'),
      cell: (item) =>
        getFriendlyId(Parent_Type_Enum.ChangeRequest, item.SequentialId),
      exportVal: (item) =>
        getFriendlyId(Parent_Type_Enum.ChangeRequest, item.SequentialId),
    },
    ParentSequentialId: {
      id: 'parentSeqId',
      header: t('columns.parentId'),
    },
    ParentName: {
      id: 'parentName',
      header: t('columns.parentName'),
      cell: (item) =>
        item.parent ? (
          <Link
            variant={'secondary'}
            href={'#'}
            onFollow={() => gotoParentUrl(item)}
          >
            {item.ParentName}
          </Link>
        ) : (
          item.ParentName
        ),
    },
    ParentType: {
      id: 'parentType',
      header: t('columns.parentType'),
    },
    parentOwners: parentOwnersField,
    allApprovers: approversField,
    allRequesters: requestersField,
    currentApprovers: currentApproversField,
    nextApprovers: nextApproversField,
    RequiresAction: {
      id: 'requiresAction', // TODO: translation
      header: 'Requires Action',
      // TODO: translation
      cell: (item) => (item.RequiresAction ? 'Yes' : 'No'),
    },
    StatusLabelled: {
      id: 'status',
      header: t('approvals.requestsRegister.columns.status'),
      cell: (item) => (
        <SimpleRatingBadge rating={getByValue(item.ChangeRequestStatus)} />
      ),
    },

    ParentId: {
      id: 'ParentId',
      header: t('approvals.requestsRegister.columns.parentGuid'),
    },
    Workflow: {
      id: 'workflow',
      header: t('approvals.requestsRegister.columns.workflow'),
    },
    approvalConfig: {
      id: 'approvalConfig',
      header: t('approvals.requestsRegister.columns.approvalConfig'),
      cell: (item) => <BadgeList badges={item.approvalConfig} />,
      filterOptions: {
        filteringProperties: {
          operators: (['=', ':'] as PropertyFilterOperator[]).map(
            (operator) => ({
              operator,
              match: (ids: unknown, id: string) => {
                return (ids as string[]).includes(id);
              },
            })
          ),
        },
        filteringOptions: [],
      },
    },
    CreatedAtTimestamp: dateColumnFromConfig({
      header: { header: t('approvals.requestsRegister.columns.dateOpened') },
      dateField: 'CreatedAtTimestamp',
      includeTime: true,
    }),
    DateLastActioned: dateColumnFromConfig({
      header: {
        header: t('approvals.requestsRegister.columns.dateLastActioned'),
      },
      dateField: 'DateLastActioned',
      includeTime: true,
    }),
    DateClosed: dateColumnFromConfig({
      header: { header: t('approvals.requestsRegister.columns.dateClosed') },
      dateField: 'DateClosed',
      includeTime: true,
    }),
    CurrentLevel: {
      id: 'currentLevel',
      header: t('approvals.requestsRegister.columns.currentLevel'),
    },
  };

  return fields;
};

const useRequestsTableProps = (data?: GetChangeRequestsQuery) => {
  const fields = useRequestsFields();
  const labelledFields = useLabelledFields(data);

  return useMemo<UseGetTablePropsOptions<ChangeRequestRegisterFields>>(() => {
    return {
      fields,
      tableId: 'requestRegister',
      data: labelledFields,
      entityLabel: 'request',
      initialColumns: [
        'SequentialId',
        'ParentName',
        'parentOwners',
        'Workflow',
        'StatusLabelled',
        'CreatedAtTimestamp',
        'DateLastActioned',
        'DateClosed',
      ],
      preferencesStorageKey: 'RequestsRegisterTable-PreferencesV1',
      customAttributeFormIds: [],
    };
  }, [fields, labelledFields]);
};

export const useGetCollectionTableProps = (data?: GetChangeRequestsQuery) => {
  const props = useRequestsTableProps(data);

  return useGetTableProps(props);
};

export const useGetRequestsSmartWidgetTableProps = (
  data: GetChangeRequestsQuery | undefined,
  statefulTableOptions: StatefulTableOptions<ChangeRequestRegisterFields>
): TablePropsWithActions<ChangeRequestRegisterFields> => {
  const props = useRequestsTableProps(data);

  return useGetStatelessTableProps<ChangeRequestRegisterFields>({
    ...props,
    ...statefulTableOptions,
    enableFiltering: false,
  });
};
