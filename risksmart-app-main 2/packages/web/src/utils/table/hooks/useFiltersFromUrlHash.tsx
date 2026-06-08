import type {
  PropertyFilterQuery,
  PropertyFilterToken,
  PropertyFilterTokenGroup,
} from '@cloudscape-design/collection-hooks';
import type {
  SortingState,
  TableOptions,
  TypedPropertyFilterQuery,
} from '@risksmart-app/components/src/table/tableUtils';
import {
  queryStringToTableOptions,
  tableOptionsToQueryString,
} from '@risksmart-app/components/src/table/tableUtils';
import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { notEmpty } from 'src/utilityTypes';

import type { DefaultSortingState, TableRecord } from '../types';
import type { TableFieldsWithCustomAttributes } from './useAddCustomAttributeFieldData';

export const convertTokenOrTokenGroup = (
  tg: PropertyFilterToken | PropertyFilterTokenGroup
) => {
  if ('operator' in tg) {
    const token = tg;

    return convertStringifiedToken(token);
  } else if ('tokens' in tg) {
    const tGroup = tg;
    const tokenGroup: PropertyFilterTokenGroup = {
      ...tGroup,
      tokens: tGroup.tokens.map(convertTokenOrTokenGroup),
    };

    return tokenGroup;
  } else {
    throw new Error('Unsupported token');
  }
};

/**
 * Converts stringifies values into object
 * @param query
 * @returns
 */
export const convertObjectValues = (
  query: PropertyFilterQuery
): PropertyFilterQuery => {
  return {
    ...query,
    tokenGroups: query.tokenGroups
      ?.map(convertTokenOrTokenGroup)
      .filter(notEmpty),
    tokens: query.tokens.map(convertStringifiedToken),
  };
};

const convertStringifiedToken = (
  token: PropertyFilterToken
): PropertyFilterToken => {
  try {
    const parsedValue = JSON.parse(token.value);

    return {
      ...token,
      value: typeof parsedValue === 'object' ? parsedValue : token.value,
    };
  } catch {
    return token;
  }
};

/**
 * Store and retrieve filters and sorting in the url after the hash
 *
 * @returns
 */
export const useFiltersFromUrlHash = <T extends TableRecord>({
  fields,
  defaultSortingState,
  hasTokenGroupsEnabled,
  isLazyLoaded,
}: {
  fields: TableFieldsWithCustomAttributes<T>;
  defaultSortingState?: DefaultSortingState<T>;
  hasTokenGroupsEnabled?: boolean;
  isLazyLoaded?: boolean;
}) => {
  const { hash } = useLocation();

  const navigate = useNavigate();

  const updateUrlHash = useCallback(
    (options: TableOptions<T>) => {
      const queryString = tableOptionsToQueryString<T>(
        { ...options },
        hasTokenGroupsEnabled
      );

      navigate({ hash: queryString }, { replace: true });
    },
    [hasTokenGroupsEnabled, navigate]
  );

  const hasFieldDefinitions = Object.keys(fields).length > 0;

  const sortingState = useMemo<SortingState<T> | undefined>(() => {
    const tableOptions = queryStringToTableOptions(
      hash.substring(1, hash.length)
    );
    if (tableOptions.sorting) {
      const sortingField = tableOptions.sorting.sortingColumn.sortingField;

      if (sortingField) {
        // When fields is empty (e.g. CDS detail page where columns are dynamic),
        // skip field validation and allow the sorting field through.
        if (!hasFieldDefinitions) {
          return {
            ...tableOptions.sorting,
            sortingColumn: {
              sortingField,
            },
          };
        }

        const fieldDefinition =
          fields[sortingField] ??
          Object.values(fields).find((f) => f.sortingField === sortingField);

        if (fieldDefinition) {
          return {
            ...tableOptions.sorting,
            sortingColumn: {
              sortingField,
              sortingComparator: fieldDefinition.sortingComparator,
            },
          };
        }
      }
    }
    if (defaultSortingState) {
      return {
        isDescending: defaultSortingState.sortingDirection === 'desc',
        sortingColumn: {
          sortingField: defaultSortingState.sortingColumn as string,
          sortingComparator: defaultSortingState.sortingColumn
            ? fields[defaultSortingState.sortingColumn]?.sortingComparator
            : undefined,
        },
      };
    }

    return undefined;
    // Note: when a table is lazy loaded, 'fields' dep cannot be added here as it causes an
    // infinite rendering loop. Other tables however need it to update correctly for custom attributes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash, isLazyLoaded ? undefined : fields]);

  const propertyFilter = useMemo<PropertyFilterQuery | undefined>(() => {
    const tableOptions = queryStringToTableOptions(
      hash.substring(1, hash.length)
    );

    if (tableOptions.filtering) {
      const filter = convertObjectValues(tableOptions.filtering);

      // When fields is empty (e.g. CDS detail page where columns are dynamic),
      // skip token validation and allow all filters through.
      if (!hasFieldDefinitions) {
        return filter;
      }

      // Validate that all property filter fields exist in the current table
      // Filter out any tokens that reference fields not in this table
      const validTokens = filter.tokens.filter((token) => {
        if ('propertyKey' in token) {
          return fields[token.propertyKey as keyof typeof fields];
        }

        return true; // Keep non-property tokens
      });

      const validTokenGroups = filter.tokenGroups?.filter((tokenGroup) => {
        if ('tokens' in tokenGroup) {
          // For token groups, validate all tokens in the group
          const validGroupTokens = tokenGroup.tokens.filter((token) => {
            if ('propertyKey' in token) {
              return fields[token.propertyKey as keyof typeof fields];
            }

            return true;
          });

          return validGroupTokens.length > 0;
        } else if ('propertyKey' in tokenGroup) {
          // For individual tokens in tokenGroups
          return fields[tokenGroup.propertyKey as keyof typeof fields];
        }

        return true;
      });

      // Return the filter if it has valid tokens OR if it's an intentionally empty filter
      // (for clearing filters). Only ignore if there were no filtering parameters in URL at all.
      return {
        ...filter,
        tokens: validTokens,
        tokenGroups: validTokenGroups,
      };
    }

    return undefined;
    // Note: when a table is lazy loaded, 'fields' dep cannot be added here as it causes an
    // infinite rendering loop. Other tables however need it to update correctly for custom attributes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash, isLazyLoaded ? undefined : fields]);

  const setSortingState = (sortingState: SortingState<T>) => {
    updateUrlHash({
      sorting: sortingState,
      filtering: propertyFilter as TypedPropertyFilterQuery<T>,
    });
  };

  const setPropertyFilter = useCallback(
    (propertyFilter: PropertyFilterQuery) => {
      updateUrlHash({
        sorting: sortingState,
        filtering: propertyFilter as TypedPropertyFilterQuery<T>,
      });
    },
    [sortingState, updateUrlHash]
  );

  const setPropertyFilterAndSortingState = useCallback(
    ({
      propertyFilter,
      sortingState,
    }: {
      propertyFilter: PropertyFilterQuery;
      sortingState: SortingState<T>;
    }) => {
      updateUrlHash({
        sorting: sortingState,
        filtering: propertyFilter as TypedPropertyFilterQuery<T>,
      });
    },
    [updateUrlHash]
  );

  return {
    sortingState,
    propertyFilter,
    setSortingState,
    setPropertyFilter,
    setPropertyFilterAndSortingState,
    hash,
  };
};
