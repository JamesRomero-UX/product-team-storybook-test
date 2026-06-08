import i18n from '@risksmart-app/i18n/src/i18n';
import { type DocumentRegisterResponse } from '@risksmart-app/trpc/src/types';
import type {
  Document_Assessment_Result_Bool_Exp,
  Document_Bool_Exp,
  Document_File_Bool_Exp,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetDocumentsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { UseQueryOptions } from '@tanstack/react-query';
import _ from 'lodash';
import { useMemo } from 'react';
import { mapTrpcDocumentsToGraphQL } from 'src/hooks/queries/policy/useGetPolicyRegister';
import type { PolicyRegisterFields } from 'src/pages/policy/types';

import { policyRegisterUrl } from '@/utils/urls';

import { useGetPolicySmartWidgetTableProps } from '../../../policy/config';
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
  parentTypes: [Parent_Type_Enum.Document],
  hasAccess: () => true,
  documentNode: GetDocumentsDocument,
  trpcQuery: (trpc) => {
    const queryOptions = trpc.frontend.document.register.queryOptions();

    // Use select to transform the data and handle the response properly
    const transformedQueryOptions = {
      ...queryOptions,
      select: (data: DocumentRegisterResponse) => {
        return mapTrpcDocumentsToGraphQL(data);
      },
    };

    return transformedQueryOptions as UseQueryOptions<unknown, Error>;
  },
  useDefaultVariables: () =>
    ({
      where: {},
      filesWhere: {},
      documentAssessmentResultsWhere: {},
    }) as {
      where: Document_Bool_Exp;
      filesWhere: Document_File_Bool_Exp;
      documentAssessmentResultsWhere: Document_Assessment_Result_Bool_Exp;
      includeAssessmentResultsHistory?: boolean;
    },
  useTablePropsHook: (data, options) => {
    const assessmentData = useMemo(
      () =>
        data?.assessment_result_parent.map((ar) => ar.documentAssessmentResult),
      [data?.assessment_result_parent]
    );

    return useGetPolicySmartWidgetTableProps(
      data?.document,
      assessmentData,
      options
    );
  },
  entityNamePlural: 'document_other',
  entityNameSingular: 'document_one',
  fields: 'policy.fields',
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
      where: getQueryVariables(myItemsFilters, userId).documentFilterConditions,
    }),
  },
  clickThroughUrl: (filters) => policyRegisterUrl(filters),
  categoryGetters: [
    ...tagAndDepartmentCategoryGetters<PolicyRegisterFields>(),
    {
      id: 'owner',
      name: () => i18n.t('policy.columns.owner'),
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
      name: () => i18n.t('policy.columns.contributor'),
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
      id: 'rating',
      name: () => i18n.t('policy.columns.rating'),
      categoryGetter: (data) => ({
        sortKey: `${data.PerformanceResultValue ?? -1}`,
        key: data.PerformanceResultValue ?? UNRATED,
        label: data.PerformanceResultValue
          ? (data.PerformanceResult ?? UNRATED)
          : UNRATED,
      }),
      ratingColourKey: 'performance_result',
      clickthroughFilter:
        defaultClickthroughFilterWithUnrated('PerformanceResult'),
    },
    {
      id: 'status',
      name: () => i18n.t('policy.columns.status'),
      categoryGetter: (data) => ({
        key: data.StatusValue ?? UNRATED,
        label: data.StatusValue ? (data.Status ?? 'No Status') : 'No Status',
      }),
      ratingColourKey: 'document_file_status',
      clickthroughFilter: defaultClickthroughFilterWithUnrated('Status'),
    },
    {
      id: 'lastReviewedDate',
      name: () => i18n.t('policy.columns.review_date'),
      categoryGetter: (data) =>
        data.ReviewDate ? new Date(data.ReviewDate) : null,
      date: true,
      dashboardDateFilterOverride: (dateRange, precision) => ({
        filesWhere: { ReviewDate: dateRangeFilter(dateRange, precision) },
      }),
      clickthroughFilter: dateRangeClickthroughFilter('ReviewDate'),
    },
    {
      id: 'nextReviewDue',
      name: () => i18n.t('policy.columns.review_due'),
      categoryGetter: (data) =>
        data.NextReviewDate ? new Date(data.NextReviewDate) : null,
      date: true,
      dashboardDateFilterOverride: (dateRange, precision) => ({
        filesWhere: { NextReviewDate: dateRangeFilter(dateRange, precision) },
      }),
      clickthroughFilter: dateRangeClickthroughFilter('NextReviewDate'),
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
      id: 'performanceTrend',
      name: () => i18n.t('policy.columns.performanceTrend'),
      categoryGetter: (item) => ({
        key: item.PerformanceTrend ?? UNRATED,
        label: item.PerformanceTrendLabelled ?? UNRATED,
      }),
      ratingColourKey: 'effectiveness_trend',
      clickthroughFilter: defaultClickthroughFilterWithUnrated(
        'PerformanceTrendLabelled',
        { unratedValue: UNRATED }
      ),
    },
  ],
});
