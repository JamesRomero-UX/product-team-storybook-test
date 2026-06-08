import i18n from '@risksmart-app/i18n/src/i18n';
import type { ThirdPartyRegisterResponse } from '@risksmart-app/trpc/src/types';
import {
  GetThirdPartiesDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { UseQueryOptions } from '@tanstack/react-query';
import { mapTrpcThirdPartiesToGraphQL } from 'src/hooks/queries/third-party/useGetThirdPartyRegister';

import { thirdPartyRegisterUrl } from '@/utils/urls';

import { useGetThirdPartySmartWidgetTableProps } from '../../../third-party/config';
import type { ThirdPartyRegisterFields } from '../../../third-party/types';
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
  defaultClickthroughFilterWithUnrated,
  tagAndDepartmentCategoryGetters,
} from '../dataSourceHelpers';

export default createDataSource({
  parentTypes: [Parent_Type_Enum.ThirdParty],
  hasAccess: (_, isModuleEnabled) => isModuleEnabled('third_party'),
  documentNode: GetThirdPartiesDocument,
  trpcQuery: (trpc) => {
    const queryOptions = trpc.frontend.thirdParty.register.queryOptions();

    // Use select to transform the data and handle the response properly
    const transformedQueryOptions = {
      ...queryOptions,
      select: (data: ThirdPartyRegisterResponse) => {
        return mapTrpcThirdPartiesToGraphQL(data);
      },
    };

    return transformedQueryOptions as UseQueryOptions<unknown, Error>;
  },
  useDefaultVariables: () => ({ where: {} }),
  useTablePropsHook: (data, options) =>
    useGetThirdPartySmartWidgetTableProps(data?.third_party, options),
  entityNamePlural: 'third_party_other',
  entityNameSingular: 'third_party_one',
  fields: 'third_party.fields',
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
        .thirdPartyFilterConditions,
    }),
  },
  clickThroughUrl: (filter) => thirdPartyRegisterUrl(filter),
  categoryGetters: [
    ...tagAndDepartmentCategoryGetters<ThirdPartyRegisterFields>(),
    {
      id: 'type',
      name: () => i18n.t('columns.type'),
      categoryGetter: (item) => ({
        key: item.Type ?? UNRATED,
        label: item.TypeLabelled ?? UNRATED,
      }),
      ratingColourKey: 'third_party_type',
      clickthroughFilter: defaultClickthroughFilterWithUnrated('TypeLabelled'),
    },
    {
      id: 'status',
      name: () => i18n.t('columns.status'),
      categoryGetter: (item) => ({
        key: item.Status ?? UNRATED,
        label: item.StatusLabelled ?? UNRATED,
      }),
      ratingColourKey: 'third_party_status',
      clickthroughFilter:
        defaultClickthroughFilterWithUnrated('StatusLabelled'),
    },
    {
      id: 'criticality',
      name: () => i18n.t('third_party.columns.criticality'),
      categoryGetter: (item) => ({
        key: item.Criticality ?? UNRATED,
        label: item.CriticalityLabelled ?? UNRATED,
        sortKey: `${item.Criticality}`,
      }),
      ratingColourKey: 'criticality',
      clickthroughFilter: defaultClickthroughFilterWithUnrated(
        'CriticalityLabelled'
      ),
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
      name: () => i18n.t(`columns.contributor`),
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
