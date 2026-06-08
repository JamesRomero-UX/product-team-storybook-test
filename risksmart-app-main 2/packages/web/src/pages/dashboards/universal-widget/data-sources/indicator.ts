import i18n from '@risksmart-app/i18n/src/i18n';
import type { IndicatorRegisterResponse } from '@risksmart-app/trpc/src/types';
import type {
  Indicator_Bool_Exp,
  Indicator_Result_Bool_Exp,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetIndicatorsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { UseQueryOptions } from '@tanstack/react-query';
import { mapTrpcIndicatorsToGraphQL } from 'src/hooks/queries/indicator/useGetIndicatorRegister';
import type { IndicatorTableFields } from 'src/pages/indicators/types';

import useEntityWhereFilter from '@/hooks/useEntityWhereFilter';
import { indicatorRegisterUrl } from '@/utils/urls';

import { useGetIndicatorSmartWidgetTableProps } from '../../../indicators/config';
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
  defaultClickthroughFilterWithUnrated,
  tagAndDepartmentCategoryGetters,
} from '../dataSourceHelpers';

export default createDataSource({
  hasAccess: () => true,
  documentNode: GetIndicatorsDocument,
  trpcQuery: (trpc) => {
    const queryOptions = trpc.frontend.indicator.register.queryOptions();

    // Use select to transform the data and handle the response properly
    const transformedQueryOptions = {
      ...queryOptions,
      select: (data: IndicatorRegisterResponse) => {
        return mapTrpcIndicatorsToGraphQL(data);
      },
    };

    return transformedQueryOptions as UseQueryOptions<unknown, Error>;
  },
  parentTypes: [Parent_Type_Enum.Indicator],
  useDefaultVariables: () =>
    ({
      where: useEntityWhereFilter<Indicator_Bool_Exp>(
        Parent_Type_Enum.Indicator
      ),
      resultsWhere: {},
    }) as {
      where: Indicator_Bool_Exp;
      resultsWhere: Indicator_Result_Bool_Exp;
    },
  useTablePropsHook: (data, options) =>
    useGetIndicatorSmartWidgetTableProps(data?.indicator, options),
  entityNamePlural: 'indicator_other',
  entityNameSingular: 'indicator_one',
  fields: 'indicators.fields',
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
      where: getQueryVariables(myItemsFilters, userId)
        .indicatorFilterConditions,
    }),
  },
  clickThroughUrl: (filter) => indicatorRegisterUrl({ filtering: filter }),
  categoryGetters: [
    ...tagAndDepartmentCategoryGetters<IndicatorTableFields>(),
    {
      id: 'frequency',
      name: () => i18n.t('indicators.columns.test_frequency'),
      categoryGetter: (item) => item.TestFrequencyLabelled ?? UNRATED,
      clickthroughFilter: defaultClickthroughFilterWithUnrated(
        'TestFrequencyLabelled'
      ),
    },
    {
      id: 'conformance',
      name: () => i18n.t('indicators.columns.conformance'),
      categoryGetter: (item) => ({
        key: item.Conformance ?? UNRATED,
        label: String(item?.ConformanceLabelled ?? UNRATED),
      }),
      ratingColourKey: 'indicator_conformance_status',
      clickthroughFilter: defaultClickthroughFilterWithUnrated(
        'ConformanceLabelled'
      ),
    },
    {
      id: 'conformanceTrend',
      name: () => i18n.t('indicators.columns.conformance_trend'),
      categoryGetter: (item) => ({
        key: String(item?.ConformanceTrend ?? UNRATED),
        label: String(item?.ConformanceTrend ?? UNRATED),
      }),
      ratingColourKey: 'indicator_conformance_trend',
      clickthroughFilter:
        defaultClickthroughFilterWithUnrated('ConformanceTrend'),
    },
    {
      id: 'latestResult',
      name: () => i18n.t('indicators.columns.latest_result'),
      categoryGetter: (item) => item.LatestResultLabelled ?? null,
      clickthroughFilter: defaultClickthroughFilterWithUnrated(
        'LatestResultLabelled'
      ),
    },
    {
      id: 'latestResultDate',
      name: () => i18n.t('indicators.columns.latest_result_date'),
      categoryGetter: (item) => item.orderedResults[0]?.ResultDate ?? null,
      date: true,
      dashboardDateFilterOverride: (dateRange, precision) => ({
        where: {
          results: {
            ResultDate: dateRangeFilter(dateRange, precision),
          },
        },
      }),
      clickthroughFilter: dateRangeClickthroughFilter(
        'LatestResultDateLabelled'
      ),
    },
    {
      id: 'unit',
      name: () => i18n.t('indicators.columns.unit'),
      categoryGetter: (item) => item.Unit ?? null,
      clickthroughFilter: defaultClickthroughFilterWithUnrated('Unit'),
    },
    {
      id: 'testScheduleStatus',
      name: () => i18n.t('indicators.columns.testScheduleStatus'),
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
      id: 'owner',
      name: () => i18n.t('columns.owner'),
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
      name: () => i18n.t('columns.contributor'),
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
  ],
});
