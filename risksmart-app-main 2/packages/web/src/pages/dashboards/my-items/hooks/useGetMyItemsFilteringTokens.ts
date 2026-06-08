import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import type { TypedPropertyFilterToken } from '@risksmart-app/components/src/table/tableUtils';
import type { GetMyItemsDashboardQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { isEqual, uniqWith } from 'lodash';
import { useCallback } from 'react';

import type { CollectionData } from '@/utils/collectionUtils';

import { useDashboardStore } from '../../useDashboardStore';

export type FilterableRibbonData = {
  ownerGroups?: CollectionData<
    GetMyItemsDashboardQuery['action'][0]['ownerGroups']
  >;
  contributorGroups?: CollectionData<
    GetMyItemsDashboardQuery['action'][0]['contributorGroups']
  >;
};

/**
 * Provides a function that will build up the URL filtering tokens based on the current
 * filters set on the dashboard (used for click-through functionality on the ribbon).
 * @returns getMyItemsFilteringTokens function
 */
export const useGetMyItemsFilteringTokens = <T>() => {
  const { user } = useRisksmartUser();
  const {
    myItemsFilters: { owner, contributor, groupOwner, groupContributor },
  } = useDashboardStore();

  const getMyItemsFilteringTokens = useCallback(
    (
      filteringDetails: readonly FilterableRibbonData[] | undefined,
      ownerPropertyKey: string = 'allOwners',
      contributorPropertyKey: string = 'allContributors'
    ) => {
      const tokens = [];

      if (owner) {
        tokens.push({
          propertyKey: ownerPropertyKey,
          value: user?.userId,
          operator: '=',
        });
      }
      if (contributor) {
        tokens.push({
          propertyKey: contributorPropertyKey,
          value: user?.userId,
          operator: '=',
        });
      }

      if (
        groupOwner &&
        filteringDetails &&
        filteringDetails.some((d) => d.ownerGroups)
      ) {
        const flatOwnerGroups = filteringDetails.flatMap((d) => d.ownerGroups!);
        const groupTokens = flatOwnerGroups
          .filter((g) => g.group?.users.some((u) => u.UserId === user?.userId))
          .map((g) => ({
            propertyKey: ownerPropertyKey,
            value: g.UserGroupId,
            operator: '=',
          }));
        if (groupTokens.length > 0) {
          tokens.push(...groupTokens);
        }
      }

      if (
        groupContributor &&
        filteringDetails &&
        filteringDetails.some((d) => d.contributorGroups)
      ) {
        const flatContributorGroups = filteringDetails.flatMap(
          (d) => d.contributorGroups!
        );
        const groupTokens = flatContributorGroups
          .filter((g) => g.group?.users.some((u) => u.UserId === user?.userId))
          .map((g) => ({
            propertyKey: contributorPropertyKey,
            value: g.UserGroupId,
            operator: '=',
          }));
        if (groupTokens.length > 0) {
          tokens.push(...groupTokens);
        }
      }

      return uniqWith(tokens, isEqual) as TypedPropertyFilterToken<T>[];
    },
    [contributor, groupContributor, groupOwner, owner, user?.userId]
  );

  return { getMyItemsFilteringTokens };
};
