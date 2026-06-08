import type {
  PropertyFilterOperation,
  PropertyFilterOperator,
  PropertyFilterQuery,
} from '@cloudscape-design/collection-hooks';

interface SortingColumn<T> {
  sortingField?: string;
  sortingComparator?: (a: T, b: T) => number;
}

export interface SortingState<T> {
  isDescending?: boolean;
  sortingColumn: SortingColumn<T>;
}

export interface TableOptions<T extends object> {
  filtering?: TypedPropertyFilterQuery<T>;
  sorting?: SortingState<T>;
}

export const tableOptionsToQueryString = <T extends object>(
  options: TableOptions<T>,
  enabledTokenGroups = true
) => {
  const params = new URLSearchParams();

  if (options.filtering) {
    let filtering = options.filtering;

    if (enabledTokenGroups) {
      if (filtering.tokens.length > 0) {
        filtering = { ...filtering, tokens: [], tokenGroups: filtering.tokens };
      }
    }
    params.set('filters', JSON.stringify(filtering));
  }
  if (options?.sorting?.sortingColumn.sortingField) {
    params.set('sb', options.sorting.sortingColumn.sortingField);
    params.set('so', options.sorting.isDescending ? 'DESCENDING' : 'ASCENDING');
  }

  return params.toString();
};

const queryStringToSortingState = <T>(
  queryString: string
): SortingState<T> | undefined => {
  const params = new URLSearchParams(queryString);
  const sb = params.get('sb');
  const so = params.get('so');
  if (!sb || !so || !['DESCENDING', 'ASCENDING'].includes(so)) {
    return undefined;
  }

  return {
    sortingColumn: {
      sortingField: sb,
    },
    isDescending: so === 'DESCENDING',
  };
};

const queryStringToPropertyFilterQuery = (
  queryString: string
): PropertyFilterQuery | undefined => {
  const params = new URLSearchParams(queryString);
  try {
    const filters = params.get('filters');
    if (filters) {
      const test = JSON.parse(filters);

      return test;
    }

    return undefined;
  } catch {
    return undefined;
  }
};

export const queryStringToTableOptions = (
  queryString: string
): {
  filtering?: PropertyFilterQuery;
  sorting?: SortingState<unknown>;
} => {
  return {
    filtering: queryStringToPropertyFilterQuery(queryString),
    sorting: queryStringToSortingState(queryString),
  };
};

export interface TypedPropertyFilterQuery<TableFields extends object> {
  tokens: readonly TypedPropertyFilterToken<TableFields>[];
  tokenGroups?: readonly (
    | TypedPropertyFilterGroup<TableFields>
    | TypedPropertyFilterToken<TableFields>
  )[];
  operation: PropertyFilterOperation;
}
export interface TypedPropertyFilterToken<TableFields> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  propertyKey?: Extract<keyof TableFields, string>;
  operator: PropertyFilterOperator;
}
export interface TypedPropertyFilterGroup<TableFields> {
  tokens: readonly TypedPropertyFilterToken<TableFields>[];
  operation: PropertyFilterOperation;
}
