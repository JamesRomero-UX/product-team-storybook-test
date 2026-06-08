import i18n from '@risksmart-app/i18n/src/i18n';
import type { ControlRegisterResponse } from '@risksmart-app/trpc/src/types';
import type { Control_Bool_Exp } from '@risksmart-app/web-graphql-client/generated/graphql';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetControlsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { UseQueryOptions } from '@tanstack/react-query';
import { mapTrpcControlsToGraphQL } from 'src/hooks/queries/control/useGetControlsRegister';
import type { ControlTableFields } from 'src/pages/controls/types';

import useEntityWhereFilter from '@/hooks/useEntityWhereFilter';
import { controlRegisterUrl } from '@/utils/urls';

import { useGetControlSmartWidgetTableProps } from '../../../controls/config';
import { UNRATED } from '../../gigawidget/types';
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
  defaultClickthroughFilter,
  defaultClickthroughFilterWithUnrated,
  tagAndDepartmentCategoryGetters,
} from '../dataSourceHelpers';

export default createDataSource({
  hasAccess: () => true,
  parentTypes: [Parent_Type_Enum.Control],
  documentNode: GetControlsDocument,
  trpcQuery: (trpc) => {
    const queryOptions = trpc.frontend.control.register.queryOptions({
      parentId: undefined,
    });

    // Use select to transform the data and handle the response properly
    const transformedQueryOptions = {
      ...queryOptions,
      select: (data: ControlRegisterResponse) => {
        return mapTrpcControlsToGraphQL(data);
      },
    };

    return transformedQueryOptions as UseQueryOptions<unknown, Error>;
  },
  useDefaultVariables: () => ({
    where: useEntityWhereFilter<Control_Bool_Exp>(Parent_Type_Enum.Control),
  }),
  useTablePropsHook: (data, options) =>
    useGetControlSmartWidgetTableProps(data?.control, options),
  entityNamePlural: 'control_other',
  entityNameSingular: 'control_one',
  fields: 'controls.fields',
  dashboardFilterConfig: {
    tagsFilter: (tags) => ({ where: { tags: tagsFilter(tags) } }),
    departmentsFilter: (departments) => ({
      where: { departments: departmentsFilter(departments) },
    }),
    dateFilter: (dateRange, precision) => ({
      where: { CreatedAtTimestamp: dateRangeFilter(dateRange, precision) },
    }),
    dateClickthroughFilter:
      dashboardDateRangeClickthroughFilter('CreatedAtTimestamp'),
    ownershipFilter: (myItemsFilters, userId) => ({
      where: getQueryVariables(myItemsFilters, userId).controlFilterConditions,
    }),
  },
  clickThroughUrl: (filters) => controlRegisterUrl(filters),
  categoryGetters: [
    ...tagAndDepartmentCategoryGetters<ControlTableFields>(),
    {
      id: 'effectiveness',
      name: () => i18n.t('controls.columns.effectiveness'),
      categoryGetter: (item) => {
        if (item.OverallEffectiveness === null) {
          return { key: UNRATED, label: UNRATED };
        }

        return {
          key: item.OverallEffectiveness,
          label: item.OverallEffectivenessLabelled,
        };
      },
      clickthroughFilter: defaultClickthroughFilter(
        'OverallEffectivenessLabelled'
      ),
      ratingColourKey: 'effectiveness',
    },
    {
      id: 'type',
      name: () => i18n.t('controls.columns.type'),
      categoryGetter: (item) => ({
        key: item.Type ?? UNRATED,
        label: item.Type ? item.ControlTypeLabelled : 'No Type',
      }),
      clickthroughFilter: defaultClickthroughFilterWithUnrated(
        'ControlTypeLabelled'
      ),
    },
    {
      id: 'testFrequency',
      name: () => i18n.t('controls.columns.test_frequency'),
      categoryGetter: (item) => item.TestFrequency ?? UNRATED,
      clickthroughFilter: defaultClickthroughFilterWithUnrated('TestFrequency'),
    },
    {
      id: 'owner',
      name: () => i18n.t('controls.columns.owner'),
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
      name: () => i18n.t('controls.columns.contributor'),
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
      id: 'testScheduleStatus',
      name: () => i18n.t('controls.columns.testScheduleStatus'),
      categoryGetter: (item) => {
        return item.TestScheduleStatus === '-'
          ? { key: '-', label: i18n.t('columns.unscheduled') }
          : item.TestScheduleStatusLabelled;
      },
      clickthroughFilter: (category) => [
        {
          propertyKey: 'TestScheduleStatusLabelled',
          operator: '=',
          value: category.key === '-' ? '-' : category.key,
        },
      ],
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
    {
      id: 'nextTestDate',
      name: () => i18n.t('controls.columns.next_test_date'),
      categoryGetter: (data) =>
        data.NextTestDate ? new Date(data.NextTestDate) : null,
      date: true,
      dashboardDateFilterOverride: (dateRange, precision) => ({
        where: {
          scheduleState: { DueDate: dateRangeFilter(dateRange, precision) },
        },
      }),
      clickthroughFilter: dateRangeClickthroughFilter('NextTestDate'),
    },
    {
      id: 'nextTestOverdueDate',
      name: () => i18n.t('controls.columns.nextTestOverdue'),
      categoryGetter: (data) =>
        data.NextTestOverdueDate ? new Date(data.NextTestOverdueDate) : null,
      date: true,
      dashboardDateFilterOverride: (dateRange, precision) => ({
        where: {
          scheduleState: { OverdueDate: dateRangeFilter(dateRange, precision) },
        },
      }),
      clickthroughFilter: dateRangeClickthroughFilter('NextTestOverdueDate'),
    },
    {
      id: 'effectivenessTrend',
      name: () => i18n.t('controls.columns.effectiveness_trend'),
      categoryGetter: (item) => ({
        key: item.OverallEffectivenessTrend ?? UNRATED,
        label: item.OverallEffectivenessTrendLabelled ?? UNRATED,
      }),
      ratingColourKey: 'effectiveness_trend',
      clickthroughFilter: defaultClickthroughFilter(
        'OverallEffectivenessTrendLabelled',
        { unratedValue: UNRATED }
      ),
    },
  ],
});
