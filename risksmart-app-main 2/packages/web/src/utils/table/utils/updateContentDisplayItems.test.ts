import type { CustomContentDisplayItem } from '../types';
import { updateContentDisplayItems } from './updateContentDisplayItems';

describe('table utils', () => {
  describe('updateContentDisplayItems', () => {
    it('should return an empty array if there are no default or saved content display items', () => {
      const savedItems: CustomContentDisplayItem[] = [];
      const defaultItems: CustomContentDisplayItem[] = [];
      const result = updateContentDisplayItems(savedItems, defaultItems);
      expect(result).toEqual([]);
    });

    it(`should return the visible value of saved items`, () => {
      const savedItems: CustomContentDisplayItem[] = [
        {
          id: 'current-column',
          custom: false,
          visible: false,
        },
      ];
      const defaultItems: CustomContentDisplayItem[] = [
        {
          id: 'current-column',
          custom: false,
          visible: true,
        },
      ];
      const result = updateContentDisplayItems(savedItems, defaultItems);
      expect(result).toEqual([
        {
          id: 'current-column',
          custom: false,
          visible: false,
        },
      ]);
    });

    it(`should removed saved items that don't exist in the default items`, () => {
      const savedItems: CustomContentDisplayItem[] = [
        {
          id: 'old-column',
          custom: false,
          visible: true,
        },
        {
          id: 'current-column',
          custom: false,
          visible: true,
        },
      ];
      const defaultItems: CustomContentDisplayItem[] = [
        {
          id: 'current-column',
          custom: false,
          visible: true,
        },
      ];
      const result = updateContentDisplayItems(savedItems, defaultItems);
      expect(result).toEqual([
        {
          id: 'current-column',
          custom: false,
          visible: true,
        },
      ]);
    });

    it(`should add items that don't exist in the saved items`, () => {
      const savedItems: CustomContentDisplayItem[] = [
        {
          id: 'current-column',
          custom: false,
          visible: true,
        },
      ];
      const defaultItems: CustomContentDisplayItem[] = [
        {
          id: 'current-column',
          custom: false,
          visible: true,
        },
        {
          id: 'new-column',
          custom: false,
          visible: true,
        },
      ];
      const result = updateContentDisplayItems(savedItems, defaultItems);
      expect(result).toEqual([
        {
          id: 'current-column',
          custom: false,
          visible: true,
        },
        {
          id: 'new-column',
          custom: false,
          visible: true,
        },
      ]);
    });
  });
});
