import { renderHook } from '@testing-library/react';

import { mockControlsData, mockDataSource } from '../mocks';
import { departmentGetter } from '../util/categoryGetters';
import { useAggregateCategories } from './useAggregateCategories';

describe('useCountedCategories', () => {
  it('should return an empty array if there is no data', () => {
    const { result } = renderHook(() =>
      useAggregateCategories({
        dataSource: mockDataSource,
        items: [],
        categoryGetter: departmentGetter(),
      })
    );

    expect(result.current.length).toBeLessThan(1);
  });

  it('should return an array of categories and counts when there is data', () => {
    const { result } = renderHook(() =>
      useAggregateCategories({
        dataSource: mockDataSource,
        items: mockControlsData,
        categoryGetter: departmentGetter(),
      })
    );

    expect(result.current.length).toBe(2); // 2 categories for 2 departments

    const department1Category = result.current.find((c) => c.key === '1');
    const department2Category = result.current.find((c) => c.key === '2');

    expect(department1Category).toBeDefined();
    expect(department2Category).toBeDefined();

    expect(department1Category?.aggregatedValue).toBe(3); // 3 in department 1
    expect(department2Category?.aggregatedValue).toBe(1); // 1 in department 2
  });

  it('should return an array of categories their correct labels if labels are provided', () => {
    const { result } = renderHook(() =>
      useAggregateCategories({
        dataSource: mockDataSource,
        items: mockControlsData,
        categoryGetter: departmentGetter(),
      })
    );

    expect(result.current.length).toBe(2);

    const department1Category = result.current.find((c) => c.key === '1');
    const department2Category = result.current.find((c) => c.key === '2');

    expect(department1Category).toBeDefined();
    expect(department2Category).toBeDefined();

    expect(department1Category?.label).toBe('Department 1');
    expect(department2Category?.label).toBe('Department 2');
  });

  it('should return correct categories with subcategories if a subcategoryGetter is supplied', () => {
    const { result } = renderHook(() =>
      useAggregateCategories({
        dataSource: mockDataSource,
        items: mockControlsData,
        categoryGetter: departmentGetter(),
        subCategoryGetter: (item) => {
          return item.OverallEffectiveness ?? null;
        },
      })
    );

    const department1Category = result.current.find((c) => c.key === '1');
    const department2Category = result.current.find((c) => c.key === '2');

    expect(department1Category).toBeDefined();
    expect(department2Category).toBeDefined();

    // there are 2 unique values for OverallEffectiveness in department 1
    expect(department1Category?.subCategories?.length).toBe(2);
    // there is only 1 unique value for OverallEffectiveness in department 2
    expect(department2Category?.subCategories?.length).toBe(1);

    const department1OverallEffectiveness2 =
      department1Category?.subCategories?.find((c) => c.key === 2);

    const department1OverallEffectiveness3 =
      department1Category?.subCategories?.find((c) => c.key === 3);

    const department2OverallEffectiveness2 =
      department2Category?.subCategories?.find((c) => c.key === 2);

    expect(department1OverallEffectiveness2).toBeDefined();
    expect(department1OverallEffectiveness3).toBeDefined();
    expect(department2OverallEffectiveness2).toBeDefined();

    expect(department1OverallEffectiveness2?.aggregatedValue).toBe(2);
    expect(department1OverallEffectiveness3?.aggregatedValue).toBe(1);
    expect(department2OverallEffectiveness2?.aggregatedValue).toBe(1);
  });
});
