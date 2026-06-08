import type {
  PropertyFilterProperty,
  PropertyFilterQuery,
} from '@cloudscape-design/collection-hooks';
import { isEqual } from 'lodash';
import type { FC } from 'react';

import { processItems } from '../../../node_modules/@cloudscape-design/collection-hooks/mjs/operations';
import { DashboardItem } from './DashboardItem';

type FilerPropertyDashboardItemProps = {
  items: readonly unknown[];
  title: string;
  itemFilterQuery: PropertyFilterQuery;
  onClick: (query: PropertyFilterQuery) => void;
  tableFilterQuery: PropertyFilterQuery;
  filteringProperties: readonly PropertyFilterProperty[];
};

export const FilterPropertyDashboardItem: FC<
  FilerPropertyDashboardItemProps
> = ({
  items,
  title,
  itemFilterQuery,
  onClick,
  tableFilterQuery,
  filteringProperties,
}) => {
  const filteredItems = processItems(
    items ?? [],
    {
      propertyFilteringQuery: itemFilterQuery,
    },
    { propertyFiltering: { filteringProperties: filteringProperties ?? [] } }
  );

  const areFilterQueriesEquivalent = (
    itemFilterQuery: PropertyFilterQuery,
    tableFilterQuery: PropertyFilterQuery
  ): boolean => {
    const queriesAreEqual = isEqual(itemFilterQuery, tableFilterQuery);
    const tokensAreEqualToTokenGroups =
      isEqual(
        itemFilterQuery?.tokens || [],
        tableFilterQuery?.tokenGroups || []
      ) &&
      isEqual(
        itemFilterQuery?.tokenGroups || [],
        tableFilterQuery?.tokens || []
      );

    return queriesAreEqual || tokensAreEqualToTokenGroups;
  };

  return (
    <DashboardItem
      title={title}
      value={filteredItems.filteredItemsCount ?? 0}
      selected={areFilterQueriesEquivalent(itemFilterQuery, tableFilterQuery)}
      onClick={() => onClick(itemFilterQuery)}
    />
  );
};
