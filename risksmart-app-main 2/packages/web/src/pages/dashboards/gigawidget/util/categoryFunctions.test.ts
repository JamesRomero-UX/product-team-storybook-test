import dayjs from 'dayjs';

import type { CategoryType } from '../types';
import { aggregateCategories } from './categoryFunctions';

describe('aggregateCategories', () => {
  it('should count categories correctly', () => {
    const data = [
      { category: 'A', value: 1 },
      { category: 'B', value: 2 },
      { category: 'A', value: 3 },
      { category: 'B', value: 4 },
      { category: 'C', value: 5 },
    ];

    const categoryGetter = (item: { category: CategoryType; value: number }) =>
      item.category;

    const result = aggregateCategories(data, categoryGetter, 'day');

    expect(result).toEqual([
      { key: 'A', label: 'A', aggregatedValue: 2, data: [data[0], data[2]] },
      { key: 'B', label: 'B', aggregatedValue: 2, data: [data[1], data[3]] },
      { key: 'C', label: 'C', aggregatedValue: 1, data: [data[4]] },
    ]);
  });

  it('should handle date categories correctly', () => {
    const data = [
      { category: dayjs('2022-01-01').toISOString(), value: 1 },
      { category: dayjs('2022-01-01').toISOString(), value: 2 },
      { category: dayjs('2022-01-02').toISOString(), value: 3 },
    ];

    const categoryGetter = (item: { category: string; value: number }) =>
      item.category;

    const result = aggregateCategories(data, categoryGetter, 'day');

    expect(result).toEqual([
      {
        key: dayjs('2022-01-01').toDate(),
        label: String(dayjs('2022-01-01').format()),
        aggregatedValue: 2,
        data: [data[0], data[1]],
      },
      {
        key: dayjs('2022-01-02').toDate(),
        label: String(dayjs('2022-01-02').format()),
        aggregatedValue: 1,
        data: [data[2]],
      },
    ]);
  });

  it('should handle null categories correctly', () => {
    const data = [
      { category: null, value: 1 },
      { category: 'A', value: 2 },
    ];

    const categoryGetter = (item: {
      category: CategoryType | null;
      value: number;
    }) => item.category;

    const result = aggregateCategories(data, categoryGetter, 'day');

    expect(result).toEqual([
      { key: 'A', label: 'A', aggregatedValue: 1, data: [data[1]] },
    ]);
  });

  describe('aggregations', () => {
    it('should sum values correctly', () => {
      const data = [
        { category: 'A', value: 1 },
        { category: 'A', value: 2 },
        { category: 'A', value: 3 },
      ];

      const categoryGetter = (item: {
        category: CategoryType;
        value: number;
      }) => item.category;

      const result = aggregateCategories(
        data,
        categoryGetter,
        'day',
        'DD MMM YYYY',
        'sum',
        'value'
      );

      expect(result).toEqual([
        { key: 'A', label: 'A', aggregatedValue: 6, data: data },
      ]);
    });

    it('should average values correctly', () => {
      const data = [
        { category: 'A', value: 1 },
        { category: 'A', value: 2 },
        { category: 'A', value: 3 },
      ];

      const categoryGetter = (item: {
        category: CategoryType;
        value: number;
      }) => item.category;

      const result = aggregateCategories(
        data,
        categoryGetter,
        'day',
        'DD MMM YYYY',
        'mean',
        'value'
      );

      expect(result).toEqual([
        { key: 'A', label: 'A', aggregatedValue: 2, data: data },
      ]);
    });
  });
});
