import type { CustomContentDisplayItem } from '../types';

/**
 * Merges the default and custom saved preferences for column visibility
 *
 * @param savedItems
 * @param defaultItems
 * @returns
 */
export const updateContentDisplayItems = (
  savedItems: CustomContentDisplayItem[],
  defaultItems: CustomContentDisplayItem[]
) => {
  const ids = defaultItems.map(({ id }) => id);
  const existingItemsMap: { [key: string]: CustomContentDisplayItem } =
    savedItems
      .filter(({ id }) => ids.includes(id))
      .reduce((map, item) => ({ ...map, [item.id]: item }), {});
  const updatedDisplay = defaultItems.filter(({ id }) => !existingItemsMap[id]);

  return [
    ...Object.values(existingItemsMap),
    ...updatedDisplay,
  ] as readonly CustomContentDisplayItem[];
};
