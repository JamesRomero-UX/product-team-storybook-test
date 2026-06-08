import i18n from '@risksmart-app/i18n/src/i18n';
import type { InternalAuditEntityRegisterResponse } from '@risksmart-app/trpc/src/types';
import {
  GetInternalAuditsDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { UseQueryOptions } from '@tanstack/react-query';
import { mapTrpcInternalAuditEntitiesToGraphQL } from 'src/hooks/queries/internal-audit/useGetInternalAuditEntitiesRegister';

import { internalAuditRegisterUrl } from '@/utils/urls';

import { useGetInternalAuditsSmartWidgetTableProps } from '../../../internal-audit/config';
import type { InternalAuditRegisterFields } from '../../../internal-audit/types';
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

const data = createDataSource({
  parentTypes: [Parent_Type_Enum.InternalAuditEntity],
  hasAccess: (_, isModuleEnabled) => isModuleEnabled('internal_audit_entity'),
  documentNode: GetInternalAuditsDocument,
  trpcQuery: (trpc) => {
    const queryOptions =
      trpc.frontend.internalAuditEntity.register.queryOptions();

    // Use select to transform the data and handle the response properly
    const transformedQueryOptions = {
      ...queryOptions,
      select: (data: InternalAuditEntityRegisterResponse) => {
        return mapTrpcInternalAuditEntitiesToGraphQL(data);
      },
    };

    return transformedQueryOptions as UseQueryOptions<unknown, Error>;
  },
  useDefaultVariables: () => ({ where: {} }),
  useTablePropsHook: (data, options) =>
    useGetInternalAuditsSmartWidgetTableProps(
      data?.internal_audit_entity,
      options
    ),
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
        .internalAuditFilterConditions,
    }),
  },
  entityNamePlural: 'internal_audit_other',
  entityNameSingular: 'internal_audit_one',
  fields: 'internalAudits.fields',
  clickThroughUrl: (filter) => internalAuditRegisterUrl(filter),
  categoryGetters: [
    ...tagAndDepartmentCategoryGetters<InternalAuditRegisterFields>(),
    {
      id: 'businessArea',
      name: () => i18n.t('internalAudits.columns.BusinessArea'),
      categoryGetter: (item) => ({
        key: item.BusinessArea,
        label: item.BusinessArea,
      }),
      clickthroughFilter: defaultClickthroughFilterWithUnrated('BusinessArea'),
    },
    {
      id: 'reportStatus',
      name: () => i18n.t('internalAudits.columns.ReportStatusLabelled'),
      categoryGetter: (item) => ({
        key: item.ReportStatus,
        label: item.ReportStatusLabelled ?? UNRATED,
      }),
      clickthroughFilter: defaultClickthroughFilterWithUnrated(
        'ReportStatusLabelled'
      ),
    },
    {
      id: 'auditRating',
      name: () => i18n.t('internalAudits.columns.AuditRatingLabelled'),
      categoryGetter: (item) => ({
        key: item.AuditRating ?? UNRATED,
        label:
          item.AuditRatingLabelled === '-' ? UNRATED : item.AuditRatingLabelled,
      }),
      clickthroughFilter: defaultClickthroughFilterWithUnrated(
        'AuditRatingLabelled'
      ),
    },
    {
      id: 'latestReportDate',
      name: () => i18n.t('internalAudits.columns.LatestReportDate'),
      categoryGetter: (data) =>
        !data.LatestReportDate || data.LatestReportDate === '-'
          ? null
          : new Date(data.LatestReportDate),
      date: true,
      dashboardDateFilterOverride: (dateRange, precision) => ({
        where: { LatestReportDate: dateRangeFilter(dateRange, precision) },
      }),
      clickthroughFilter: dateRangeClickthroughFilter('LatestReportDate'),
    },
    {
      id: 'owner',
      name: () => i18n.t('internalAudits.columns.Owner'),
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
      id: 'contributors',
      name: () => i18n.t('columns.contributors'),
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
export default data;
