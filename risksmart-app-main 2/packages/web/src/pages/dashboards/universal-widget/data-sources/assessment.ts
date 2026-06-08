import i18n from '@risksmart-app/i18n/src/i18n';
import type { AssessmentRegisterResponse } from '@risksmart-app/trpc/src/types';
import {
  GetAssessmentsDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { UseQueryOptions } from '@tanstack/react-query';
import { mapTrpcAssessmentsToGraphQL } from 'src/hooks/queries/assessment/useGetAssessmentsRegister';
import { useGetAssessmentSmartWidgetTableProps } from 'src/pages/assessments/config';
import type { AssessmentRegisterFields } from 'src/pages/assessments/types';

import { assessmentRegisterUrl } from '@/utils/urls';

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
  tagAndDepartmentCategoryGetters,
} from '../dataSourceHelpers';

export default createDataSource({
  hasAccess: () => true,
  documentNode: GetAssessmentsDocument,
  trpcQuery: (trpc) => {
    const queryOptions = trpc.frontend.assessment.register.queryOptions();

    // Use select to transform the data and handle the response properly
    const transformedQueryOptions = {
      ...queryOptions,
      select: (data: AssessmentRegisterResponse) => {
        return mapTrpcAssessmentsToGraphQL(data);
      },
    };

    return transformedQueryOptions as UseQueryOptions<unknown, Error>;
  },
  useDefaultVariables: () => ({ where: {} }),
  parentTypes: [Parent_Type_Enum.Assessment],
  useTablePropsHook: (data, options) =>
    useGetAssessmentSmartWidgetTableProps(data?.assessment, options),
  entityNamePlural: 'assessment_other',
  entityNameSingular: 'assessment_one',
  fields: 'assessments.fields',
  dashboardFilterConfig: {
    tagsFilter: (tags) => ({ where: { tags: tagsFilter(tags) } }),
    departmentsFilter: (departments) => ({
      where: { departments: departmentsFilter(departments) },
    }),
    dateFilter: (dateRange, precision) => ({
      where: { CreatedAtTimestamp: dateRangeFilter(dateRange, precision) },
    }),
    ownershipFilter: (myItemsFilters, userId) => ({
      where: getQueryVariables(myItemsFilters, userId)
        .assessmentFilterConditions,
    }),
    dateClickthroughFilter:
      dashboardDateRangeClickthroughFilter('CreatedAtTimestamp'),
  },
  clickThroughUrl: (filters) => assessmentRegisterUrl(filters),
  categoryGetters: [
    ...tagAndDepartmentCategoryGetters<AssessmentRegisterFields>(),
    {
      id: 'owner',
      name: () => i18n.t('assessments.columns.Owner'),
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
      name: () => i18n.t('assessments.columns.contributor'),
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
      id: 'completionDate',
      name: () => i18n.t('assessments.columns.CompletionDate'),
      categoryGetter: (data) =>
        data.ActualCompletionDate ? new Date(data.ActualCompletionDate) : null,
      date: true,
      dashboardDateFilterOverride: (dateRange, precision) => ({
        where: { ActualCompletionDate: dateRangeFilter(dateRange, precision) },
      }),
      clickthroughFilter: dateRangeClickthroughFilter('ActualCompletionDate'),
    },
    {
      id: 'startDate',
      name: () => i18n.t('assessments.columns.StartDate'),
      categoryGetter: (data) =>
        data.StartDate ? new Date(data.StartDate) : null,
      date: true,
      dashboardDateFilterOverride: (dateRange, precision) => ({
        where: { StartDate: dateRangeFilter(dateRange, precision) },
      }),
      clickthroughFilter: dateRangeClickthroughFilter('StartDate'),
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
