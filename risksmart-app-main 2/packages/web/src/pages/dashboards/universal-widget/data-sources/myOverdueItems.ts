import type { ResultOf, VariablesOf } from '@graphql-typed-document-node/core';
import type { MyDueItemsResponse } from '@risksmart-app/trpc/src/types';
import { GetMyDueItemsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { UseQueryOptions } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { mapTrpcMyDueItemsToGraphQL } from 'src/hooks/queries/my-items/useGetMyDueItems';

import type { MyOverdueItemFields } from '../../my-items/config';
import { useGetMyOverdueItemsSmartWidgetTableProps } from '../../my-items/config';
import { getQueryVariables } from '../../my-items/hooks/useGetQueryVariables';
import type { MyItemsFilter } from '../../useDashboardStore';
import { defaultMyItemsFilter } from '../../useDashboardStore';
import { createDataSource } from '../createDataSource';

type MyDueItemsVariables = VariablesOf<typeof GetMyDueItemsDocument> & {
  ownershipFilter?: MyItemsFilter;
};

const createMyItemsDataSource = (dueDateLength: number) =>
  createDataSource<
    MyOverdueItemFields,
    MyDueItemsVariables,
    ResultOf<typeof GetMyDueItemsDocument>
  >({
    parentTypes: [],
    hasAccess: () => true,
    documentNode: GetMyDueItemsDocument,
    trpcQuery: (trpc, vars) => {
      const ownershipFilter = vars.ownershipFilter ?? defaultMyItemsFilter;

      const queryOptions = trpc.frontend.myItems.dueItems.queryOptions({
        date: vars.date,
        userId: vars.userId,
        ownershipFilter,
      });

      const transformedQueryOptions = {
        ...queryOptions,
        select: (data: MyDueItemsResponse) => {
          return mapTrpcMyDueItemsToGraphQL(data);
        },
      };

      return transformedQueryOptions as UseQueryOptions<unknown, Error>;
    },
    useDefaultVariables: (userId) => {
      const date = dayjs().add(dueDateLength, 'day').endOf('day').toISOString();

      return {
        userId: userId ?? '',
        date,
        riskFilterConditions: {},
        actionFilterConditions: {},
        assessmentFilterConditions: {},
        controlFilterConditions: {},
        issueFilterConditions: {},
        assessmentActivityFilterConditions: {},
        documentFilterConditions: {},
        indicatorFilterConditions: {},
        obligationFilterConditions: {},
      };
    },
    useTablePropsHook: (data, options) =>
      useGetMyOverdueItemsSmartWidgetTableProps(data, options),
    fields: 'dashboard.myItemsDashboard.fields',
    entityNamePlural: 'my_item_other',
    entityNameSingular: 'my_item_one',
    dashboardFilterConfig: {
      ownershipFilter: (myItemsFilters, userId) => ({
        ...getQueryVariables(myItemsFilters, userId),
        ownershipFilter: myItemsFilters,
      }),
    },
    categoryGetters: [],
  });

export const myOverdueItems7Days = createMyItemsDataSource(7);
export const myOverdueItems30Days = createMyItemsDataSource(30);
