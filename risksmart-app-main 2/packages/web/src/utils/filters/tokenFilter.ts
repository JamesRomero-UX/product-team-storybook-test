import type { PropertyFilterProperty } from '@cloudscape-design/collection-hooks';

import type { FilterModal } from '@/components/customisable-ribbon/customisableRibbonModalSchema';

import { processItems } from '../../../node_modules/@cloudscape-design/collection-hooks/mjs/operations';

/**
 * Apply a filter query to determine if an item matches the filter criteria.
 * This is used for counting items that match CustomisableRibbon filters.
 *
 * @param item - The item to test against the filter
 * @param itemFilterQuery - The filter query from FilterModal
 * @param filteringProperties - Optional filtering properties for the item type
 * @returns true if the item matches the filter, false otherwise
 */
export const applyTokenFilter = <T>(
  item: T,
  itemFilterQuery: FilterModal['itemFilterQuery'],
  filteringProperties?: readonly PropertyFilterProperty[]
): boolean => {
  try {
    // Use Cloudscape's processItems to test if the single item matches the filter
    const result = processItems(
      [item],
      {
        propertyFilteringQuery: itemFilterQuery,
      },
      {
        propertyFiltering: {
          filteringProperties: filteringProperties ?? [],
        },
      }
    );

    // Return true if the item was included in the filtered result
    return result.items.length > 0;
  } catch (error) {
    // If filtering fails, assume the item doesn't match
    console.warn('Error applying token filter:', error);

    return false;
  }
};

/**
 * Apply a filter query to a collection of items and return the filtered results.
 *
 * @param items - The items to filter
 * @param itemFilterQuery - The filter query from FilterModal
 * @param filteringProperties - Optional filtering properties for the item type
 * @returns The filtered items array
 */
export const applyTokenFilterToCollection = <T>(
  items: T[],
  itemFilterQuery: FilterModal['itemFilterQuery'],
  filteringProperties?: readonly PropertyFilterProperty[]
): readonly T[] => {
  try {
    const result = processItems(
      items,
      {
        propertyFilteringQuery: itemFilterQuery,
      },
      {
        propertyFiltering: {
          filteringProperties: filteringProperties ?? [],
        },
      }
    );

    return result.items;
  } catch (error) {
    console.warn('Error applying token filter to collection:', error);

    return [];
  }
};
