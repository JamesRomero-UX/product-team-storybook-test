import { describe, expect, it } from 'vitest';

import { sortByDateX } from './utils';

describe('over-time-widgets utils', () => {
  describe('sortByDateX', () => {
    it('should sort items by date in ascending order', () => {
      const items = [
        { x: '2024-03-15', value: 1 },
        { x: '2024-01-10', value: 2 },
        { x: '2024-02-20', value: 3 },
      ];

      const sorted = items.sort(sortByDateX);

      expect(sorted).toEqual([
        { x: '2024-01-10', value: 2 },
        { x: '2024-02-20', value: 3 },
        { x: '2024-03-15', value: 1 },
      ]);
    });

    it('should handle ISO date strings with time', () => {
      const items = [
        { x: '2024-01-15T14:30:00Z', value: 1 },
        { x: '2024-01-15T10:30:00Z', value: 2 },
        { x: '2024-01-15T18:30:00Z', value: 3 },
      ];

      const sorted = items.sort(sortByDateX);

      expect(sorted).toEqual([
        { x: '2024-01-15T10:30:00Z', value: 2 },
        { x: '2024-01-15T14:30:00Z', value: 1 },
        { x: '2024-01-15T18:30:00Z', value: 3 },
      ]);
    });
  });
});
