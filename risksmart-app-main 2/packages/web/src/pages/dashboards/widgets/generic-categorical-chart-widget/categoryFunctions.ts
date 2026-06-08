type BarChartKey = Date | number | string;
type PieChartKey = null | number | string | undefined;
export type CategoryKey = BarChartKey | PieChartKey;

export type Category<T extends CategoryKey> = {
  key: T;
  count: number;
};

export const countCategories = <T, K extends CategoryKey>(
  array: T[],
  categoryGetter: (item: T) => K,
  placeholderCategories?: K[]
): Category<K>[] => {
  const categories: Category<K>[] =
    placeholderCategories?.map((cat) => ({
      key: cat,
      count: 0,
    })) ?? [];

  array.forEach((item) => {
    const category = categoryGetter(item);
    const existingCategory = categories.find((c) => c.key === category);

    if (existingCategory) {
      existingCategory.count += 1;
    } else {
      categories.push({
        key: category,
        count: 1,
      });
    }
  });

  return categories;
};
