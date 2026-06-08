import i18n from '@risksmart-app/i18n/src/i18n';
import type { ConsequenceRegisterResponse } from '@risksmart-app/trpc/src/types';
import type { Consequence_Bool_Exp } from '@risksmart-app/web-graphql-client/generated/graphql';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetConsequencesDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { UseQueryOptions } from '@tanstack/react-query';
import { mapTrpcConsequencesToGraphQL } from 'src/hooks/queries/consequence/useGetConsequenceRegister';
import { useGetConsequenceSmartWidgetTableProps } from 'src/pages/consequences/config';
import type { ConsequenceRegisterFields } from 'src/pages/consequences/types';

import useEntityWhereFilter from '@/hooks/useEntityWhereFilter';
import { getFriendlyId } from '@/utils/friendlyId';
import type { StatefulTableOptions } from '@/utils/table/hooks/useGetStatelessTableProps';
import { consequencesRegisterUrl } from '@/utils/urls';

import { UNRATED } from '../../gigawidget/types';
import { departmentGetter } from '../../gigawidget/util/categoryGetters';
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
  hasAccess: (_, isModuleEnabled) =>
    isModuleEnabled('issue.subModules.consequence'),
  parentTypes: [Parent_Type_Enum.Consequence],
  documentNode: GetConsequencesDocument,
  trpcQuery: (trpc) => {
    const queryOptions = trpc.frontend.consequence.register.queryOptions();

    // Use select to transform the data and handle the response properly
    const transformedQueryOptions = {
      ...queryOptions,
      select: (data: ConsequenceRegisterResponse) => {
        return mapTrpcConsequencesToGraphQL(data);
      },
    };

    return transformedQueryOptions as UseQueryOptions<unknown, Error>;
  },
  useDefaultVariables: () => ({
    where: useEntityWhereFilter<Consequence_Bool_Exp>(
      Parent_Type_Enum.Consequence
    ),
  }),
  useTablePropsHook: (
    data,
    options: StatefulTableOptions<ConsequenceRegisterFields>
  ) => useGetConsequenceSmartWidgetTableProps(data?.consequence, options),
  entityNamePlural: 'consequence_other',
  entityNameSingular: 'consequence_one',
  fields: 'consequences.fields',
  dashboardFilterConfig: {
    dateFilter: (dateRange, precision) => ({
      where: { CreatedAtTimestamp: dateRangeFilter(dateRange, precision) },
    }),
    dateClickthroughFilter:
      dashboardDateRangeClickthroughFilter('CreatedAtTimestamp'),
    tagsFilter: (tags) => ({ where: { issue: { tags: tagsFilter(tags) } } }),
    departmentsFilter: (departments) => ({
      where: { issue: { departments: departmentsFilter(departments) } },
    }),
    ownershipFilter: (myItemsFilters, userId) => ({
      where: {
        issue: getQueryVariables(myItemsFilters, userId).issueFilterConditions,
      },
    }),
  },
  clickThroughUrl: (filters) => consequencesRegisterUrl(filters),
  categoryGetters: [
    ...tagAndDepartmentCategoryGetters<ConsequenceRegisterFields>(),
    {
      id: 'issueId',
      name: () => i18n.t('consequences.columns.issueId'),
      categoryGetter: (item) => ({
        key: item.IssueSequentialId ?? UNRATED,
        label: item.IssueSequentialId
          ? getFriendlyId(Parent_Type_Enum.Issue, item.IssueSequentialId)
          : UNRATED,
      }),
      clickthroughFilter: defaultClickthroughFilterWithUnrated(
        'IssueSequentialId',
        {
          categoryValue: 'key',
        }
      ),
    },
    {
      id: 'issueRaisedDate',
      name: () => i18n.t('consequences.columns.issueRaisedDate'),
      categoryGetter: (item) =>
        item.IssueRaisedDate ? new Date(item.IssueRaisedDate) : null,
      clickthroughFilter: dateRangeClickthroughFilter('IssueRaisedDate'),
      date: true,
      dashboardDateFilterOverride: (dateRange, precision) => ({
        where: {
          issue: { CreatedAtTimestamp: dateRangeFilter(dateRange, precision) },
        },
      }),
    },
    {
      id: 'issueClosedDate',
      name: () => i18n.t('consequences.columns.issueClosedDate'),
      categoryGetter: (item) =>
        item.IssueClosedDate ? new Date(item.IssueClosedDate) : null,
      clickthroughFilter: dateRangeClickthroughFilter('IssueClosedDate'),
      date: true,
      dashboardDateFilterOverride: (dateRange, precision) => ({
        where: {
          issue: {
            assessment: {
              ActualCloseDate: dateRangeFilter(dateRange, precision),
            },
          },
        },
      }),
    },
    {
      id: 'issueStatus',
      name: () => i18n.t('consequences.columns.issueStatus'),
      categoryGetter: (item) => ({
        key: item.IssueStatus ?? UNRATED,
        label: item.IssueStatusLabelled ?? UNRATED,
      }),
      ratingColourKey: 'issue_assessment_status',
      clickthroughFilter: defaultClickthroughFilterWithUnrated(
        'IssueStatusLabelled'
      ),
    },
    {
      id: 'issueType',
      name: () => i18n.t('consequences.columns.issueType'),
      categoryGetter: (item) => ({
        key: item.IssueType ?? UNRATED,
        label: item.IssueType ? item.IssueTypeLabelled : UNRATED,
      }),
      clickthroughFilter:
        defaultClickthroughFilterWithUnrated('IssueTypeLabelled'),
    },
    {
      id: 'issueSeverity',
      name: () => i18n.t('consequences.columns.issueSeverity'),
      categoryGetter: (item) => ({
        key: item.IssueSeverity ?? UNRATED,
        label: item.IssueSeverityLabelled ?? UNRATED,
      }),
      ratingColourKey: 'severity',
      clickthroughFilter: defaultClickthroughFilterWithUnrated(
        'IssueSeverityLabelled'
      ),
    },
    {
      id: 'issueTitle',
      name: () => i18n.t('consequences.columns.issue'),
      categoryGetter: (item) => ({
        key: item.IssueTitle,
        label: item.IssueTitle,
      }),
      clickthroughFilter: defaultClickthroughFilterWithUnrated('IssueTitle'),
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
    {
      id: 'title',
      name: () => i18n.t('consequences.columns.title'),
      categoryGetter: (item) => ({
        key: item.Title,
        label: item.Title,
      }),
      clickthroughFilter: defaultClickthroughFilterWithUnrated('Title'),
    },
    {
      id: 'criticality',
      name: () => i18n.t('consequences.columns.criticality'),
      categoryGetter: (item) => ({
        key: item.Criticality,
        label: item.CriticalityLabelled ?? UNRATED,
        sortKey: `${item.Criticality}`,
      }),
      ratingColourKey: 'criticality',
      clickthroughFilter: defaultClickthroughFilterWithUnrated(
        'CriticalityLabelled'
      ),
    },
    {
      id: 'type',
      name: () => i18n.t('consequences.columns.type'),
      categoryGetter: (item) => ({
        key: item.TypeLabelled,
        label: item.TypeLabelled,
      }),
      clickthroughFilter: defaultClickthroughFilterWithUnrated('TypeLabelled'),
    },
    {
      id: 'costType',
      name: () => i18n.t('consequences.columns.costType'),
      categoryGetter: (item) => ({
        key: item.CostTypeLabelled,
        label: item.CostTypeLabelled,
      }),
      clickthroughFilter:
        defaultClickthroughFilterWithUnrated('CostTypeLabelled'),
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
      id: 'assessmentDepartments',
      name: () => i18n.t('consequences.columns.assessmentDepartments'),
      categoryGetter: (item) =>
        item.issue?.assessment
          ? departmentGetter({ includeNoDepartments: true })(
              item.issue.assessment
            )
          : null,
      clickthroughFilter: (category) => [
        {
          propertyKey: 'AssessmentDepartments',
          operator: category.key === UNRATED ? '<' : '=',
          value: category.key === UNRATED ? 1 : category.key,
        },
      ],
    },
  ],
});
