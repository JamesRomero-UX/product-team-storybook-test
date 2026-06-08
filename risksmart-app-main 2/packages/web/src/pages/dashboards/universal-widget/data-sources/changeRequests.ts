import type { ResultOf, VariablesOf } from '@graphql-typed-document-node/core';
import i18n from '@risksmart-app/i18n/src/i18n';
import {
  GetChangeRequestsDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';

import { useChangeRequests } from '@/hooks/useChangeRequests';
import { requestsRegisterUrl } from '@/utils/urls';

import { useGetRequestsSmartWidgetTableProps } from '../../../requests/config';
import type { ChangeRequestRegisterFields } from '../../../requests/types';
import { dateRangeFilter } from '../../gigawidget/util/filterHelpers';
import { useDashboardStore } from '../../useDashboardStore';
import { createDataSource } from '../createDataSource';
import {
  dashboardDateRangeClickthroughFilter,
  dateRangeClickthroughFilter,
  defaultClickthroughFilterWithUnrated,
} from '../dataSourceHelpers';

export default createDataSource<
  ChangeRequestRegisterFields,
  VariablesOf<typeof GetChangeRequestsDocument>,
  ResultOf<typeof GetChangeRequestsDocument>
>({
  parentTypes: [Parent_Type_Enum.ChangeRequest],
  hasAccess: (_, isModuleEnabled) => isModuleEnabled('approval'),
  documentNode: GetChangeRequestsDocument,
  trpcQuery: () => {
    // TODO: Implement tRPC query for change requests, need TRPC endpoint for register to be created
    throw new Error('tRPC query not implemented for change requests');
  },
  useDefaultVariables: (userId) => ({
    where: {},
    currentUserId: userId ?? '',
  }),
  useTablePropsHook: (data, options) =>
    useGetRequestsSmartWidgetTableProps(data, options),
  dashboardFilterConfig: {
    dateFilter: (dateRange, precision) => ({
      where: { CreatedAtTimestamp: dateRangeFilter(dateRange, precision) },
    }),
    dateClickthroughFilter:
      dashboardDateRangeClickthroughFilter('CreatedAtTimestamp'),
  },
  useInitialDataFilter: (data, allowOwnershipFiltering) => {
    // Client side filtering of change requests is required for my items
    // as we rely on the local isActiveApprover hook
    const {
      myItemsFilters: { owner },
    } = useDashboardStore();
    const { isActiveApprover } = useChangeRequests();
    const filteredData = useMemo(() => {
      if (data) {
        return {
          ...data,
          change_request: data.change_request.filter(
            (item) =>
              !allowOwnershipFiltering ||
              (owner &&
                isActiveApprover(
                  item,
                  item.currentUserOwnerList?.map((u) => u.UserId ?? '')
                ))
          ),
        };
      } else {
        return undefined;
      }
    }, [allowOwnershipFiltering, data, isActiveApprover, owner]);

    return filteredData;
  },
  entityNamePlural: 'request_other',
  entityNameSingular: 'request_one',
  fields: 'requests',
  clickThroughUrl: (filters) => requestsRegisterUrl(filters),
  categoryGetters: [
    {
      id: 'parentName',
      name: () => i18n.t('columns.parentName'),
      categoryGetter: (item) => ({
        key: item.ParentName,
        label: item.ParentName ?? '',
      }),
      clickthroughFilter: defaultClickthroughFilterWithUnrated('ParentName'),
    },
    {
      id: 'parentType',
      name: () => i18n.t('columns.parentType'),
      categoryGetter: (item) => ({
        key: item.ParentType,
        label: item.ParentType ?? '',
      }),
      clickthroughFilter: defaultClickthroughFilterWithUnrated('ParentType'),
    },
    {
      id: 'contributor',
      name: () => i18n.t('columns.contributor'),
      categoryGetter: (item) =>
        item.contributors.map((contributor) => ({
          key: contributor.user?.Id ?? '',
          label: contributor.user?.FriendlyName ?? '',
        })),
      clickthroughFilter: (category) => [
        {
          propertyKey: 'contributors',
          operator: '=',
          value: category.key,
        },
      ],
    },
    {
      id: 'requestedBy',
      name: () => i18n.t('columns.requesters'),
      categoryGetter: (item) =>
        item.allRequesters.map((requester) => ({
          key: requester.id,
          label: requester.label,
        })),
      clickthroughFilter: (category) => [
        {
          propertyKey: 'allRequesters',
          operator: '=',
          value: category.key,
        },
      ],
    },
    {
      id: 'status',
      name: () => i18n.t('approvals.requestsRegister.columns.status'),
      categoryGetter: (item) => ({
        key: item.StatusLabelled,
        label: item.StatusLabelled ?? '',
      }),
      clickthroughFilter:
        defaultClickthroughFilterWithUnrated('StatusLabelled'),
    },
    {
      id: 'workflow',
      name: () => i18n.t('approvals.requestsRegister.columns.workflow'),
      categoryGetter: (item) => ({
        key: item.Workflow,
        label: item.Workflow ?? '',
      }),
      clickthroughFilter: defaultClickthroughFilterWithUnrated('Workflow'),
    },
    {
      id: 'openedDate',
      name: () => i18n.t('approvals.requestsRegister.columns.dateOpened'),
      categoryGetter: (data) =>
        !data.CreatedAtTimestamp || data.CreatedAtTimestamp === '-'
          ? null
          : new Date(data.CreatedAtTimestamp),
      date: true,
      dashboardDateFilterOverride: (dateRange, precision) => ({
        where: { CreatedAtTimestamp: dateRangeFilter(dateRange, precision) },
      }),
      clickthroughFilter: dateRangeClickthroughFilter('CreatedAtTimestamp'),
    },
    {
      id: 'lastActionedDate',
      name: () => i18n.t('approvals.requestsRegister.columns.dateLastActioned'),
      categoryGetter: (data) =>
        !data.DateLastActioned || data.DateLastActioned === '-'
          ? null
          : new Date(data.DateLastActioned),
      clickthroughFilter: dateRangeClickthroughFilter('DateLastActioned'),
    },
    {
      id: 'closedDate',
      name: () => i18n.t('approvals.requestsRegister.columns.dateClosed'),
      categoryGetter: (data) =>
        !data.DateClosed || data.DateClosed === '-'
          ? null
          : new Date(data.DateClosed),
      clickthroughFilter: dateRangeClickthroughFilter('DateClosed'),
    },
    {
      id: 'currentApprovers',
      name: () => i18n.t('columns.currentApprovers'),
      categoryGetter: (item) =>
        item.currentApprovers.map((approver) => ({
          key: approver.id,
          label: approver.label,
        })),
      clickthroughFilter: (category) => [
        {
          propertyKey: 'currentApprovers',
          operator: '=',
          value: category.key,
        },
      ],
    },
    {
      id: 'nextApprovers',
      name: () => i18n.t('columns.nextApprovers'),
      categoryGetter: (item) =>
        item.nextApprovers.map((approver) => ({
          key: approver.id,
          label: approver.label,
        })),
      clickthroughFilter: (category) => [
        {
          propertyKey: 'nextApprovers',
          operator: '=',
          value: category.key,
        },
      ],
    },
  ],
});
