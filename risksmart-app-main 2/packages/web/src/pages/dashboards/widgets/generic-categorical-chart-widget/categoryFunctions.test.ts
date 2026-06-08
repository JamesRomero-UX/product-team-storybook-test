import type { CategoryKey } from './categoryFunctions';
import { countCategories } from './categoryFunctions';

describe('countCategories', () => {
  it('counts categories correctly for different types of keys', () => {
    const items = [
      { category: 'apple' },
      { category: 'banana' },
      { category: 'apple' },
      { category: 1 },
      { category: null },
      { category: 1 },
    ];

    const categoryGetter = (item: { category: CategoryKey }) => item.category;

    const result = countCategories(items, categoryGetter);

    expect(result).toEqual([
      { key: 'apple', count: 2 },
      { key: 'banana', count: 1 },
      { key: 1, count: 2 },
      { key: null, count: 1 },
    ]);
  });

  it('returns an empty array for an empty input array', () => {
    const result = countCategories([], (item) => item);
    expect(result).toEqual([]);
  });

  it('handles single item arrays', () => {
    const items = [{ category: 'onlyCategory' }];
    const categoryGetter = (item: { category: CategoryKey }) => item.category;

    const result = countCategories(items, categoryGetter);

    expect(result).toEqual([{ key: 'onlyCategory', count: 1 }]);
  });
});
