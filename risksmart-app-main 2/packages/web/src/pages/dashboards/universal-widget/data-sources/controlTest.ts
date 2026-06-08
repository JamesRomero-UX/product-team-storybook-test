import type { ResultOf, VariablesOf } from '@graphql-typed-document-node/core';
import i18n from '@risksmart-app/i18n/src/i18n';
import type { Test_Result_Bool_Exp } from '@risksmart-app/web-graphql-client/generated/graphql';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetWidgetTestResultsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';
import { useMemo } from 'react';
import type { ControlTestTableFields } from 'src/pages/controls/control-tests/types';

import useEntityWhereFilter from '@/hooks/useEntityWhereFilter';
import { controlTestsRegisterUrl } from '@/utils/urls';

import { useGetControlTestSmartWidgetTableProps } from '../../../controls/control-tests/config';
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
} from '../dataSourceHelpers';

export default createDataSource<
  ControlTestTableFields,
  VariablesOf<typeof GetWidgetTestResultsDocument>,
  ResultOf<typeof GetWidgetTestResultsDocument>
>({
  parentTypes: [Parent_Type_Enum.TestResult],
  hasAccess: () => true,
  documentNode: GetWidgetTestResultsDocument,
  trpcQuery: () => {
    // TODO: Implement tRPC query for control tests, TRPC register not yet converted.
    throw new Error('tRPC query not implemented for control tests');
  },
  useDefaultVariables: () => ({
    where: useEntityWhereFilter<Test_Result_Bool_Exp>(
      Parent_Type_Enum.TestResult,
      {
        RatingType: {
          _in: ['assessment', 'rating'],
        },
      }
    ),
  }),
  useTablePropsHook: (data, options) => {
    const testData = useMemo(
      () => data?.control.flatMap((c) => c.testResults),
      [data?.control]
    );

    return useGetControlTestSmartWidgetTableProps(testData, options);
  },
  entityNamePlural: 'control_test_other',
  entityNameSingular: 'control_test_one',
  fields: 'testResults.columns',
  dashboardFilterConfig: {
    tagsFilter: (tags) => ({ controlWhere: { tags: tagsFilter(tags) } }),
    departmentsFilter: (departments) => ({
      controlWhere: { departments: departmentsFilter(departments) },
    }),
    dateFilter: (dateRange, precision) => ({
      where: { CreatedAtTimestamp: dateRangeFilter(dateRange, precision) },
    }),
    dateClickthroughFilter:
      dashboardDateRangeClickthroughFilter('CreatedAtTimestamp'),
    ownershipFilter: (myItemsFilters, userId) => ({
      controlWhere: getQueryVariables(myItemsFilters, userId)
        .controlFilterConditions,
    }),
  },
  clickThroughUrl: (filters) => controlTestsRegisterUrl(filters),
  categoryGetters: [
    {
      id: 'testType',
      name: () => i18n.t('testResults.columns.test_type'),
      categoryGetter: (data) => ({
        key: data.TestType ?? UNRATED,
        label: data.TestType ? data.TestTypeLabelled : 'No Type',
      }),
      clickthroughFilter:
        defaultClickthroughFilterWithUnrated('TestTypeLabelled'),
    },
    {
      id: 'result',
      name: () => i18n.t('testResults.columns.overall_effectiveness'),
      categoryGetter: (data) => ({
        key: data.OverallEffectiveness ?? null,
        label: data.OverallEffectivenessLabelled ?? UNRATED,
      }),
      ratingColourKey: 'effectiveness',
      clickthroughFilter: defaultClickthroughFilterWithUnrated(
        'OverallEffectivenessLabelled'
      ),
    },
    {
      id: 'designEffectiveness',
      name: () => i18n.t('testResults.columns.design_effectiveness'),
      categoryGetter: (data) => ({
        key: data.DesignEffectiveness ?? null,
        label: data.DesignEffectivenessLabelled ?? UNRATED,
      }),
      ratingColourKey: 'design_effectiveness',
      clickthroughFilter: defaultClickthroughFilterWithUnrated(
        'DesignEffectivenessLabelled'
      ),
    },
    {
      id: 'performanceEffectiveness',
      name: () => i18n.t('testResults.columns.performance_effectiveness'),
      categoryGetter: (data) => ({
        key: data.PerformanceEffectiveness ?? null,
        label: data.PerformanceEffectivenessLabelled ?? UNRATED,
      }),
      ratingColourKey: 'performance_effectiveness',
      clickthroughFilter: defaultClickthroughFilterWithUnrated(
        'PerformanceEffectivenessLabelled'
      ),
    },
    {
      id: 'performedBy',
      name: () => i18n.t('testResults.columns.submitter'),
      categoryGetter: (data) => data.SubmitterNameLabelled,
      clickthroughFilter: defaultClickthroughFilterWithUnrated(
        'SubmitterNameLabelled'
      ),
    },
    {
      id: 'testDate',
      name: () => i18n.t('testResults.columns.date'),
      categoryGetter: (data) => new Date(data.TestDate),
      date: true,
      dashboardDateFilterOverride: (dateRange, precision) => ({
        where: { TestDate: dateRangeFilter(dateRange, precision) },
      }),
      clickthroughFilter: dateRangeClickthroughFilter('TestDate'),
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
