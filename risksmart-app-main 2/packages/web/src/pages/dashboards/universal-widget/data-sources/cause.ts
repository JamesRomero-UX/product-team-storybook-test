import i18n from '@risksmart-app/i18n/src/i18n';
import type { CauseRegisterResponse } from '@risksmart-app/trpc/src/types';
import type { Cause_Bool_Exp } from '@risksmart-app/web-graphql-client/generated/graphql';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetCausesDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { UseQueryOptions } from '@tanstack/react-query';
import { mapTrpcCausesToGraphQL } from 'src/hooks/queries/cause/useGetCauseRegister';
import { useGetCauseSmartWidgetTableProps } from 'src/pages/causes/config';
import type { CauseRegisterFields } from 'src/pages/causes/types';

import useEntityWhereFilter from '@/hooks/useEntityWhereFilter';
import { getFriendlyId } from '@/utils/friendlyId';
import type { StatefulTableOptions } from '@/utils/table/hooks/useGetStatelessTableProps';
import { causesRegisterUrl } from '@/utils/urls';

import { UNRATED } from '../../gigawidget/types';
import { departmentGetter } from '../../gigawidget/util/categoryGetters';
import { dateRangeFilter } from '../../gigawidget/util/filterHelpers';
import { getQueryVariables } from '../../my-items/hooks/useGetQueryVariables';
import { createDataSource } from '../createDataSource';
import {
  dashboardDateRangeClickthroughFilter,
  dateRangeClickthroughFilter,
  defaultClickthroughFilterWithUnrated,
} from '../dataSourceHelpers';

export default createDataSource({
  hasAccess: (_, isModuleEnabled) => isModuleEnabled('issue.subModules.cause'),
  documentNode: GetCausesDocument,
  trpcQuery: (trpc) => {
    const queryOptions = trpc.frontend.cause.register.queryOptions();

    // Use select to transform the data and handle the response properly
    const transformedQueryOptions = {
      ...queryOptions,
      select: (data: CauseRegisterResponse) => {
        return mapTrpcCausesToGraphQL(data);
      },
    };

    return transformedQueryOptions as UseQueryOptions<unknown, Error>;
  },
  parentTypes: [Parent_Type_Enum.Cause],
  useDefaultVariables: () => ({
    where: useEntityWhereFilter<Cause_Bool_Exp>(Parent_Type_Enum.Cause),
  }),
  useTablePropsHook: (
    data,
    options: StatefulTableOptions<CauseRegisterFields>
  ) => useGetCauseSmartWidgetTableProps(data?.cause, options),
  entityNamePlural: 'cause_other',
  entityNameSingular: 'cause_one',
  fields: 'causes.fields',
  dashboardFilterConfig: {
    dateFilter: (dateRange, precision) => ({
      where: { CreatedAtTimestamp: dateRangeFilter(dateRange, precision) },
    }),
    ownershipFilter: (myItemsFilters, userId) => ({
      where: {
        issue: getQueryVariables(myItemsFilters, userId).issueFilterConditions,
      },
    }),
    dateClickthroughFilter:
      dashboardDateRangeClickthroughFilter('CreatedAtTimestamp'),
  },
  clickThroughUrl: (filters) => causesRegisterUrl(filters),
  categoryGetters: [
    {
      id: 'issueId',
      name: () => i18n.t('causes.columns.issueId'),
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
      name: () => i18n.t('causes.columns.issueRaisedDate'),
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
      name: () => i18n.t('causes.columns.issueClosedDate'),
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
      name: () => i18n.t('causes.columns.issueStatus'),
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
      name: () => i18n.t('causes.columns.issueSeverity'),
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
      name: () => i18n.t('causes.columns.issue'),
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
      id: 'Title',
      name: () => i18n.t('causes.columns.title'),
      categoryGetter: (item) => ({
        key: item.Title,
        label: item.Title,
      }),
      clickthroughFilter: defaultClickthroughFilterWithUnrated('Title'),
    },
    {
      id: 'significance',
      name: () => i18n.t('causes.columns.significance'),
      categoryGetter: (item) => ({
        key: item.Significance ?? UNRATED,
        label: item.SignificanceLabelled ?? UNRATED,
      }),
      ratingColourKey: 'significance',
      clickthroughFilter: defaultClickthroughFilterWithUnrated(
        'SignificanceLabelled'
      ),
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
      name: () => i18n.t('causes.columns.assessmentDepartments'),
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
