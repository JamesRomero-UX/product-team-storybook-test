import type {
  PropertyFilterOperator,
  PropertyFilterQuery,
  PropertyFilterToken,
} from '@cloudscape-design/collection-hooks';
import type { SortingState } from '@risksmart-app/components/src/table/tableUtils';

import type { TableRecord, WhereFilter } from '../types';

const dotNotationToNestedKey = (dotNotation: string, value: unknown) => {
  const keys = dotNotation.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: Record<string, any> = {};
  let current = result;

  for (let i = 0; i < keys.length; i++) {
    if (i === keys.length - 1) {
      current[keys[i]] = value;
    } else {
      current[keys[i]] = {};
      current = current[keys[i]];
    }
  }

  return result;
};

export const sortingStateToGraphQLQuery = <T extends TableRecord>(
  sortingState: SortingState<T>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any => {
  const key = sortingState.sortingColumn.sortingField ?? '';
  const value = sortingState.isDescending ? 'desc' : 'asc';

  return dotNotationToNestedKey(key, value);
};

const operatorGraphQLOperatorMap: {
  [operator: PropertyFilterOperator]: string;
} = {
  '=': '_eq',
  '!=': '_neq',
  ':': '_ilike',
  '!:': '_nilike',
  '>': '_gt',
  '<': '_lt',
  '>=': '_gte',
  '<=': '_lte',
};

const tokenToGraphQLFilter = ({
  propertyKey,
  operator,
  value,
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
PropertyFilterToken): any => {
  let tokenValue = value;
  if (typeof tokenValue === 'string') {
    tokenValue = tokenValue.trim();
  }
  if (operator === ':' || operator === '!:') {
    tokenValue = `%${tokenValue}%`;
  }

  if (propertyKey) {
    return dotNotationToNestedKey(propertyKey, {
      [operatorGraphQLOperatorMap[operator]]: tokenValue,
    });
  }

  return {};
};

export const propertyFilterToGraphQLQuery = <T extends TableRecord>(
  propertyFilter: PropertyFilterQuery
): WhereFilter<T> => {
  const query = {} as WhereFilter<T>;
  let currentQuery = query;

  propertyFilter.tokens.forEach((token) => {
    currentQuery = { ...tokenToGraphQLFilter(token), _and: currentQuery };
  });

  return currentQuery;
};
