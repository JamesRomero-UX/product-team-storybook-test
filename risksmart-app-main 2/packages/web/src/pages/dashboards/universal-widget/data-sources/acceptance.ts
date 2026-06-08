import type { ResultOf, VariablesOf } from '@graphql-typed-document-node/core';
import i18n from '@risksmart-app/i18n/src/i18n';
import type { AcceptanceRegisterResponse } from '@risksmart-app/trpc/src/types';
import type { Acceptance_Bool_Exp } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  GetAcceptancesDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { UseQueryOptions } from '@tanstack/react-query';
import { mapTrpcAcceptancesToGraphQL } from 'src/hooks/queries/acceptance/useGetAcceptancesRegister';

import useEntityWhereFilter from '@/hooks/useEntityWhereFilter';
import { acceptanceRegisterUrl } from '@/utils/urls';

import { useGetAcceptanceSmartWidgetTableProps } from '../../../acceptances/config';
import type { AcceptanceTableFields } from '../../../acceptances/types';
import {
  dateRangeFilter,
  departmentsFilter,
  tagsFilter,
} from '../../gigawidget/util/filterHelpers';
import { getQueryVariables } from '../../my-items/hooks/useGetQueryVariables';
import type { DashboardFilter } from '../../useDashboardStore';
import { convertDateRangeValues } from '../../widgets/filterHelpers';
import { createDataSource } from '../createDataSource';
import { defaultClickthroughFilterWithUnrated } from '../dataSourceHelpers';

export default createDataSource<
  AcceptanceTableFields,
  VariablesOf<typeof GetAcceptancesDocument>,
  ResultOf<typeof GetAcceptancesDocument>
>({
  hasAccess: () => true,
  documentNode: GetAcceptancesDocument,
  trpcQuery: (trpc) => {
    const queryOptions = trpc.frontend.acceptance.register.queryOptions();

    // Use select to transform the data and handle the response properly
    const transformedQueryOptions = {
      ...queryOptions,
      select: (data: AcceptanceRegisterResponse) => {
        return mapTrpcAcceptancesToGraphQL(data);
      },
    };

    return transformedQueryOptions as UseQueryOptions<unknown, Error>;
  },
  useDefaultVariables: () => ({
    where: useEntityWhereFilter<Acceptance_Bool_Exp>(
      Parent_Type_Enum.Acceptance
    ),
  }),
  parentTypes: [Parent_Type_Enum.Acceptance],
  useTablePropsHook: (data, options) =>
    useGetAcceptanceSmartWidgetTableProps(data?.acceptance, options),
  entityNamePlural: 'acceptance_other',
  entityNameSingular: 'acceptance_one',
  fields: 'acceptances.fields',
  clickThroughUrl: (filters) => acceptanceRegisterUrl(filters),
  dashboardFilterConfig: {
    tagsFilter: (tags) => ({
      where: { parents: { risk: { tags: tagsFilter(tags) } } },
    }),
    departmentsFilter: (departments) => ({
      where: {
        parents: { risk: { departments: departmentsFilter(departments) } },
      },
    }),
    dateFilter: (dateRange, precision) => ({
      where: {
        DateAcceptedFrom: dateRangeFilter(dateRange, precision, 'gte'),
        DateAcceptedTo: dateRangeFilter(dateRange, precision, 'lte'),
      },
    }),
    ownershipFilter: (myItemsFilters, userId) => ({
      where: {
        parents: {
          risk: getQueryVariables(myItemsFilters, userId).riskFilterConditions,
        },
      },
    }),
    dateClickthroughFilter: (filter: DashboardFilter['dateRange']) => {
      const { startDate, endDate } = convertDateRangeValues(filter);

      return startDate && endDate
        ? [
            {
              propertyKey: 'DateAcceptedFrom',
              operator: '>=',
              value: startDate.toISOString(),
            } as const,
            {
              propertyKey: 'DateAcceptedTo',
              operator: '<=',
              value: endDate.toISOString(),
            } as const,
          ]
        : [];
    },
  },
  categoryGetters: [
    {
      id: 'status',
      name: () => i18n.t('acceptances.columns.status'),
      categoryGetter: (item) => ({
        key: item.Status,
        label: item.StatusLabelled,
      }),
      clickthroughFilter:
        defaultClickthroughFilterWithUnrated('StatusLabelled'),
      ratingColourKey: 'acceptance_status',
    },
  ],
});
