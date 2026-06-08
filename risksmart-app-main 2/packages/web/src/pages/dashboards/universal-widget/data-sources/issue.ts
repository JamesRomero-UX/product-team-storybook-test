import type { ParentIssueType } from '@risksmart-app/domain/src/types/consts';
import i18n from '@risksmart-app/i18n/src/i18n';
import type { IssueRegisterResponse } from '@risksmart-app/trpc/src/types';
import type { Issue_Bool_Exp } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  Issue_Assessment_Status_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetIssuesDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { UseQueryOptions } from '@tanstack/react-query';
import _ from 'lodash';
import { mapTrpcIssuesToGraphQL } from 'src/hooks/queries/issue/useGetIssueRegister';
import type { IssueRegisterFields } from 'src/pages/issues/types';

import useEntityWhereFilter from '@/hooks/useEntityWhereFilter';
import { IssueTypeMapping } from '@/utils/issueVariantUtils';

import { useGetIssueSmartWidgetTableProps } from '../../../issues/config';
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

export default (issueType: ParentIssueType) =>
  createDataSource({
    parentTypes: [issueType, IssueTypeMapping[issueType].assessmentType],
    hasAccess: (_, __, isFeatureFlagEnabled) =>
      issueType === Parent_Type_Enum.Issue ||
      !!(
        IssueTypeMapping[issueType].featureFlag &&
        isFeatureFlagEnabled(IssueTypeMapping[issueType].featureFlag)
      ),
    documentNode: GetIssuesDocument,
    trpcQuery: (trpc, vars) => {
      const queryOptions = trpc.frontend.issue.register.queryOptions({
        issueType,
        departmentTypeIds: vars.where?.departments?.DepartmentTypeId?._in
          ? vars.where?.departments?.DepartmentTypeId!._in
          : undefined,
        tagTypeIds: vars.where?.tags?.TagTypeId?._in
          ? vars.where?.tags?.TagTypeId!._in
          : undefined,
      });

      const transformedQueryOptions = {
        ...queryOptions,
        select: (data: IssueRegisterResponse) => {
          return mapTrpcIssuesToGraphQL(data);
        },
      };

      return transformedQueryOptions as UseQueryOptions<unknown, Error>;
    },
    useDefaultVariables: () => ({
      where: useEntityWhereFilter<Issue_Bool_Exp>(Parent_Type_Enum.Issue, {
        Type: {
          _in: [issueType],
        },
      }),
    }),
    useTablePropsHook: (data, options) => {
      return useGetIssueSmartWidgetTableProps(issueType, data?.issue, options);
    },
    entityNamePlural: IssueTypeMapping[issueType].entityLabelOther,
    entityNameSingular: IssueTypeMapping[issueType].entityLabel,
    fields: `${IssueTypeMapping[issueType].taxonomy}.fields`,
    dashboardFilterConfig: {
      tagsFilter: (tags) => ({
        where: {
          tags: tagsFilter(tags),
          Type: {
            _in: [issueType],
          },
        },
      }),
      departmentsFilter: (departments) => ({
        where: {
          departments: departmentsFilter(departments),
          Type: {
            _in: [issueType],
          },
        },
      }),
      dateFilter: (dateRange, precision) => ({
        where: {
          CreatedAtTimestamp: dateRangeFilter(dateRange, precision),
          Type: {
            _in: [issueType],
          },
        },
      }),
      dateClickthroughFilter:
        dashboardDateRangeClickthroughFilter('CreatedAtTimestamp'),
      ownershipFilter: (myItemsFilters, userId) => ({
        where: {
          ...getQueryVariables(myItemsFilters, userId).issueFilterConditions,
          Type: {
            _in: [issueType],
          },
        },
      }),
    },
    clickThroughUrl: (filter, sorter) =>
      IssueTypeMapping[issueType].registerUrl({
        filtering: filter,
        sorting: sorter,
      }),
    categoryGetters: [
      ...tagAndDepartmentCategoryGetters<IssueRegisterFields>(),
      {
        id: 'assessmentDepartments',
        name: () =>
          i18n.t(
            `${IssueTypeMapping[issueType].taxonomy}.columns.assessment_departments`
          ),
        categoryGetter: (item) =>
          item.assessment
            ? departmentGetter({ includeNoDepartments: true })(item.assessment)
            : null,
        clickthroughFilter: (category) => [
          {
            propertyKey: 'AssessmentDepartments',
            operator: category.key === UNRATED ? '<' : '=',
            value: category.key === UNRATED ? 1 : category.key,
          },
        ],
      },
      {
        id: 'status',
        name: () =>
          i18n.t(`${IssueTypeMapping[issueType].taxonomy}.columns.status`),
        categoryGetter: (item) => ({
          key: item.StatusLabelled
            ? item.StatusLabelled.toLowerCase()
            : Issue_Assessment_Status_Enum.Pending,
          label: item.StatusLabelled ?? UNRATED,
        }),
        clickthroughFilter:
          defaultClickthroughFilterWithUnrated('StatusLabelled'),
        ratingColourKey: 'issue_assessment_status',
      },
      {
        id: 'owner',
        name: () =>
          i18n.t(`${IssueTypeMapping[issueType].taxonomy}.columns.owner`),
        categoryGetter: (item) =>
          item.allOwners.map((owner) => ({
            key: owner.id,
            label: owner.label,
          })),
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
        name: () =>
          i18n.t(`${IssueTypeMapping[issueType].taxonomy}.columns.contributor`),
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
        id: 'impactsCustomers',
        name: () =>
          i18n.t(
            `${IssueTypeMapping[issueType].taxonomy}.columns.impacts_customer`
          ) + ' (Yes/No)',
        categoryGetter: (item) => ({
          key: String(item.ImpactsCustomer),
          label: _.isNil(item.ImpactsCustomer)
            ? 'Unspecified'
            : item.ImpactsCustomer
              ? 'Yes'
              : 'No',
        }),
        clickthroughFilter: defaultClickthroughFilterWithUnrated(
          'ImpactsCustomer',
          {
            categoryValue: 'key',
          }
        ),
      },
      {
        id: 'internalExternal',
        name: () =>
          i18n.t(
            `${IssueTypeMapping[issueType].taxonomy}.columns.is_external_issue`
          ) + ' (Yes/No)',
        categoryGetter: (item) => ({
          key: String(item.IsExternalIssue),
          label: _.isNil(item.IsExternalIssue)
            ? 'Unspecified'
            : item.IsExternalIssue
              ? 'External'
              : 'Internal',
        }),
        clickthroughFilter: defaultClickthroughFilterWithUnrated(
          'IsExternalIssue',
          {
            categoryValue: 'key',
          }
        ),
      },
      {
        id: 'severity',
        name: () =>
          i18n.t(`${IssueTypeMapping[issueType].taxonomy}.columns.severity`),
        categoryGetter: (item) => ({
          key: item.Severity ?? UNRATED,
          label: item.SeverityLabelled ?? UNRATED,
          sortKey: (item.Severity ?? -1).toString().padStart(2, '0'),
        }),
        ratingColourKey: 'severity',
        clickthroughFilter: defaultClickthroughFilterWithUnrated(
          'SeverityLabelled',
          { unratedValue: UNRATED }
        ),
      },
      {
        id: 'type',
        name: () =>
          i18n.t(`${IssueTypeMapping[issueType].taxonomy}.columns.type`),
        categoryGetter: (item) => ({
          key: item.IssueType ?? UNRATED,
          label: item.IssueType ? item.IssueTypeLabelled : 'No Type',
        }),
        clickthroughFilter:
          defaultClickthroughFilterWithUnrated('IssueTypeLabelled'),
      },
      {
        id: 'dateIdentified',
        name: () =>
          i18n.t(
            `${IssueTypeMapping[issueType].taxonomy}.columns.date_identified`
          ),
        categoryGetter: (data) => new Date(data.DateIdentified),
        date: true,
        dashboardDateFilterOverride: (dateRange, precision) => ({
          where: {
            DateIdentified: dateRangeFilter(dateRange, precision),
            Type: {
              _in: [issueType],
            },
          },
        }),
        clickthroughFilter: dateRangeClickthroughFilter('DateIdentified'),
      },
      {
        id: 'dateOccurred',
        name: () =>
          i18n.t(
            `${IssueTypeMapping[issueType].taxonomy}.columns.date_occurred`
          ),
        categoryGetter: (data) => new Date(data.DateOccurred),
        date: true,
        dashboardDateFilterOverride: (dateRange, precision) => ({
          where: {
            DateOccurred: dateRangeFilter(dateRange, precision),
            Type: {
              _in: [issueType],
            },
          },
        }),
        clickthroughFilter: dateRangeClickthroughFilter('DateOccurred'),
      },
      {
        id: 'createdDate',
        name: () =>
          i18n.t(`${IssueTypeMapping[issueType].taxonomy}.columns.createdOn`) +
          ' Date',
        categoryGetter: (data) => new Date(data.CreatedAtTimestamp),
        date: true,
        dashboardDateFilterOverride: (dateRange, precision) => ({
          where: {
            CreatedAtTimestamp: dateRangeFilter(dateRange, precision),
            Type: {
              _in: [issueType],
            },
          },
        }),
        clickthroughFilter: dateRangeClickthroughFilter('CreatedAtTimestamp'),
      },
      {
        id: 'dateRaised',
        name: () =>
          i18n.t(`${IssueTypeMapping[issueType].taxonomy}.columns.raised`) +
          ' Date',
        categoryGetter: (data) => new Date(data.RaisedAtTimestamp),
        date: true,
        dashboardDateFilterOverride: (dateRange, precision) => ({
          where: {
            RaisedAtTimestamp: dateRangeFilter(dateRange, precision),
            Type: {
              _in: [issueType],
            },
          },
        }),
        clickthroughFilter: dateRangeClickthroughFilter('RaisedAtTimestamp'),
      },
      {
        id: 'actualCloseDate',
        name: () =>
          i18n.t(
            `${IssueTypeMapping[issueType].taxonomy}.columns.actual_close_date`
          ),
        categoryGetter: (data) =>
          data.ActualCloseDate ? new Date(data.ActualCloseDate) : null,
        date: true,
        dashboardDateFilterOverride: (dateRange, precision) => ({
          where: {
            ActualCloseDate: dateRangeFilter(dateRange, precision),
            Type: {
              _in: [issueType],
            },
          },
        }),
        clickthroughFilter: dateRangeClickthroughFilter('ActualCloseDate'),
      },
      {
        id: 'targetCloseDate',
        name: () =>
          `${i18n.t(`${IssueTypeMapping[issueType].taxonomy}.columns.target_close_date`)}`,
        categoryGetter: (data) =>
          data.TargetCloseDate ? new Date(data.TargetCloseDate) : null,
        date: true,
        dashboardDateFilterOverride: (dateRange, precision) => ({
          where: {
            TargetCloseDate: dateRangeFilter(dateRange, precision),
            Type: {
              _in: [issueType],
            },
          },
        }),
        clickthroughFilter: dateRangeClickthroughFilter('TargetCloseDate'),
      },
    ],
  });
