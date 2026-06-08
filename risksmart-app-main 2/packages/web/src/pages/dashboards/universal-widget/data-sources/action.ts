import i18n from '@risksmart-app/i18n/src/i18n';
import type { ActionRegisterResponse } from '@risksmart-app/trpc/src/types';
import type { Action_Bool_Exp } from '@risksmart-app/web-graphql-client/generated/graphql';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetActionsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { UseQueryOptions } from '@tanstack/react-query';
import { mapTrpcActionsToGraphQL } from 'src/hooks/queries/action/useGetActionsRegister';
import type { ActionTableFields } from 'src/pages/actions/types';

import useEntityWhereFilter from '@/hooks/useEntityWhereFilter';
import { actionRegisterUrl } from '@/utils/urls';

import { useGetActionSmartWidgetTableProps } from '../../../actions/config';
import {
  dateRangeFilter,
  departmentsFilter,
  tagsFilter,
} from '../../gigawidget/util/filterHelpers';
import { getQueryVariables } from '../../my-items/hooks/useGetQueryVariables';
import { createDataSource } from '../createDataSource';
import {
  dashboardDateRangeClickthroughFilter,
  dateRangeClickthroughFilter,
  defaultClickthroughFilterWithUnrated,
  tagAndDepartmentCategoryGetters,
} from '../dataSourceHelpers';

export default createDataSource({
  hasAccess: () => true,
  parentTypes: [Parent_Type_Enum.Action],
  documentNode: GetActionsDocument,
  trpcQuery: (trpc, vars) => {
    const queryOptions = trpc.frontend.action.register.queryOptions({
      parentId: vars.where?.parents?.ParentId?._eq
        ? vars.where?.parents?.ParentId!._eq
        : undefined,
      departmentTypeIds: vars.where?.departments?.DepartmentTypeId?._in
        ? vars.where?.departments?.DepartmentTypeId!._in
        : undefined,
      tagTypeIds: vars.where?.tags?.TagTypeId?._in
        ? vars.where?.tags?.TagTypeId!._in
        : undefined,
    });

    // Use select to transform the data and handle the response properly
    const transformedQueryOptions = {
      ...queryOptions,
      select: (data: ActionRegisterResponse) => {
        return mapTrpcActionsToGraphQL(data);
      },
    };

    return transformedQueryOptions as UseQueryOptions<unknown, Error>;
  },
  useDefaultVariables: () => ({
    where: useEntityWhereFilter<Action_Bool_Exp>(Parent_Type_Enum.Action),
  }),
  useTablePropsHook: (data, options) =>
    useGetActionSmartWidgetTableProps(data?.action, options),
  entityNamePlural: 'action_other',
  entityNameSingular: 'action_one',
  fields: 'actions.fields',
  dashboardFilterConfig: {
    tagsFilter: (tags) => ({ where: { tags: tagsFilter(tags) } }),
    departmentsFilter: (departments) => ({
      where: { departments: departmentsFilter(departments) },
    }),
    dateFilter: (dateRange, precision) => ({
      where: { DateRaised: dateRangeFilter(dateRange, precision) },
    }),
    dateClickthroughFilter: dashboardDateRangeClickthroughFilter('DateRaised'),
    ownershipFilter: (myItemsFilters, userId) => ({
      where: getQueryVariables(myItemsFilters, userId).actionFilterConditions,
    }),
  },
  clickThroughUrl: (filters) => actionRegisterUrl(filters),
  categoryGetters: [
    ...tagAndDepartmentCategoryGetters<ActionTableFields>(),
    {
      id: 'status',
      name: () => i18n.t('actions.columns.status'),
      categoryGetter: (item) => ({
        key: item.StatusLabelled.toLowerCase(),
        label: item.StatusLabelled,
      }),
      clickthroughFilter:
        defaultClickthroughFilterWithUnrated('StatusLabelled'),
      ratingColourKey: 'action_status',
    },
    {
      id: 'priority',
      name: () => i18n.t('actions.columns.priority'),
      categoryGetter: (item) => ({
        sortKey: `${item.Priority}`,
        key: item.Priority,
        label: item.PriorityLabelled,
      }),
      clickthroughFilter:
        defaultClickthroughFilterWithUnrated('PriorityLabelled'),
      ratingColourKey: 'priority',
    },
    {
      id: 'owner',
      name: () => i18n.t('actions.columns.owner'),
      categoryGetter: (item) =>
        item.allOwners.map((owner) => ({ key: owner.id, label: owner.label })),
      clickthroughFilter: (category) => [
        {
          propertyKey: 'allOwners',
          operator: '=',
          value: category.key,
        },
      ],
    },
    {
      id: 'contributor',
      name: () => i18n.t('actions.columns.contributor'),
      categoryGetter: (item) =>
        item.allContributors.map((contributor) => ({
          key: contributor.id,
          label: contributor.label,
        })),
      clickthroughFilter: (category) => [
        {
          propertyKey: 'allContributors',
          operator: '=',
          value: category.key,
        },
      ],
    },
    {
      id: 'dateRaised',
      name: () => `${i18n.t('actions.columns.date_raised')} Date`,
      categoryGetter: (data) => new Date(data.DateRaised),
      date: true,
      dashboardDateFilterOverride: (dateRange, precision) => ({
        where: { DateRaised: dateRangeFilter(dateRange, precision) },
      }),
      clickthroughFilter: dateRangeClickthroughFilter('DateRaised'),
    },
    {
      id: 'targetCloseDate',
      name: () => `${i18n.t('actions.columns.due_date')} Date`,
      categoryGetter: (data) => new Date(data.DateDue),
      date: true,
      dashboardDateFilterOverride: (dateRange, precision) => ({
        where: { DateDue: dateRangeFilter(dateRange, precision) },
      }),
      clickthroughFilter: dateRangeClickthroughFilter('DateDue'),
    },
    {
      id: 'createdDate',
      name: () => i18n.t('columns.created_on'),
      categoryGetter: (data) => new Date(data.CreatedAtTimestamp),
      date: true,
      dashboardDateFilterOverride: (dateRange, precision) => ({
        where: { CreatedAtTimestamp: dateRangeFilter(dateRange, precision) },
      }),
      clickthroughFilter: dateRangeClickthroughFilter('CreatedAtTimestamp'),
    },
  ],
});
