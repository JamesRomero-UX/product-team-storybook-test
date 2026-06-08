import i18n from '@risksmart-app/i18n/src/i18n';
import type { ObligationRegisterResponse } from '@risksmart-app/trpc/src/types';
import type {
  Obligation_Assessment_Result_Bool_Exp,
  Obligation_Bool_Exp,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetObligationsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { UseQueryOptions } from '@tanstack/react-query';
import { useMemo } from 'react';
import { mapTrpcObligationsToGraphQL } from 'src/hooks/queries/obligation/useGetObligationsRegister';
import { useGetObligationSmartWidgetTableProps } from 'src/pages/compliance/obligations/config';
import type { ObligationTableFields } from 'src/pages/compliance/obligations/types';

import type { StatefulTableOptions } from '@/utils/table/hooks/useGetStatelessTableProps';
import { obligationRegister } from '@/utils/urls';

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
  hasAccess: (_, isModuleEnabled) => isModuleEnabled('obligation'),
  documentNode: GetObligationsDocument,
  trpcQuery: (trpc) => {
    const queryOptions = trpc.frontend.obligation.register.queryOptions();

    // Use select to transform the data and handle the response properly
    const transformedQueryOptions = {
      ...queryOptions,
      select: (data: ObligationRegisterResponse) => {
        return mapTrpcObligationsToGraphQL(data);
      },
    };

    return transformedQueryOptions as UseQueryOptions<unknown, Error>;
  },
  useDefaultVariables: () =>
    ({
      where: {},
      filesWhere: {},
      obligationAssessmentResultsWhere: {},
    }) as {
      where: Obligation_Bool_Exp;
      obligationAssessmentResultsWhere: Obligation_Assessment_Result_Bool_Exp;
      includeAssessmentResultsHistory?: boolean;
    },
  parentTypes: [Parent_Type_Enum.Obligation],
  useTablePropsHook: (
    data,
    options: StatefulTableOptions<ObligationTableFields>
  ) => {
    const assessmentResults = useMemo(
      () =>
        data?.assessment_result_parent.map(
          (ar) => ar.obligationAssessmentResult
        ),
      [data?.assessment_result_parent]
    );

    return useGetObligationSmartWidgetTableProps(
      data?.obligation,
      assessmentResults,
      options
    );
  },
  entityNamePlural: 'obligation_other',
  entityNameSingular: 'obligation_one',
  fields: 'obligations.fields',
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
        .obligationFilterConditions,
    }),
  },
  clickThroughUrl: (filters) => obligationRegister(filters),
  categoryGetters: [
    ...tagAndDepartmentCategoryGetters<ObligationTableFields>(),
    {
      id: 'title',
      name: () => i18n.t('obligations.columns.Title'),
      categoryGetter: (item) => ({
        key: item.Title,
        label: item.Title,
      }),
      clickthroughFilter: defaultClickthroughFilterWithUnrated('Title'),
    },
    {
      id: 'typeLabel',
      name: () => i18n.t('obligations.columns.Type'),
      categoryGetter: (item) => ({
        key: item.TypeLabel,
        label: item.TypeLabel,
      }),
      clickthroughFilter: defaultClickthroughFilterWithUnrated('TypeLabel'),
    },
    {
      id: 'owner',
      name: () => i18n.t('obligations.columns.Owner'),
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
      name: () => i18n.t(`obligations.columns.Contributor`),
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
      name: () => i18n.t('obligations.columns.Rating'),
      categoryGetter: (item) => ({
        sortKey: `${item.LatestAssessmentResult ?? -1}`,
        key: item.LatestAssessmentResult ?? UNRATED,
        label: item.LatestAssessmentResultsLabelled ?? UNRATED,
      }),
      clickthroughFilter: defaultClickthroughFilterWithUnrated(
        'LatestAssessmentResultsLabelled',
        {
          unratedValue: UNRATED,
        }
      ),
    },
    {
      id: 'createdDate',
      name: () => i18n.t('obligations.columns.CreatedAt'),
      categoryGetter: (data) => new Date(data.CreatedAtTimestamp),
      date: true,
      dashboardDateFilterOverride: (dateRange, precision) => ({
        where: { CreatedAtTimestamp: dateRangeFilter(dateRange, precision) },
      }),
      clickthroughFilter: dateRangeClickthroughFilter('CreatedAtTimestamp'),
    },
    {
      id: 'ratingTrend',
      name: () => i18n.t('obligations.columns.RatingTrend'),
      categoryGetter: (item) => ({
        key: item.RatingTrend ?? UNRATED,
        label: item.RatingTrendLabelled ?? UNRATED,
      }),
      ratingColourKey: 'effectiveness_trend',
      clickthroughFilter: defaultClickthroughFilterWithUnrated(
        'RatingTrendLabelled',
        { unratedValue: UNRATED }
      ),
    },
  ],
});
