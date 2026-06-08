import type { PropertyFilterQuery } from '@cloudscape-design/collection-hooks';

import type { ItemFilterQuery } from '@/components/customisable-ribbon/customisableRibbonModalSchema';

export { EMPTY_CELL } from './EmptyCell';

export const EMPTY_VALUE = '-';

export type CollectionData<T> = Omit<T, '__typename'>;

export const emptyFilterQuery: PropertyFilterQuery = {
  tokens: [],
  tokenGroups: [],
  operation: 'and',
};
export const emptyItemFilterQuery: ItemFilterQuery = {
  tokens: [],
  tokenGroups: [],
  operation: 'and',
};

export const getCounter = (count: number | undefined, loading: boolean) => {
  if (count === undefined || loading) {
    return '';
  }

  return `(${count})`;
};
