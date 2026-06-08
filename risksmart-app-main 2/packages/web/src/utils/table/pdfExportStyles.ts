import { getColorStyles } from '@risksmart-app/components/src/utils/colours';

// Shared helpers to compute PDF export cell styles based on rating options.
// These mirror the logic originally implemented in pages/risks/config.tsx.

export type ColorLike = { color?: string } | null | undefined;

export const styleFromOption = (
  opt: ColorLike
): ReturnType<typeof getColorStyles> | null => {
  return opt?.color ? getColorStyles(opt.color) : null;
};

export const exportStyleFromValue = <TItem, TValue>(
  valueSelector: (item: TItem) => TValue | null | undefined,
  optionGetter: (value: TValue) => ColorLike
) => {
  return (item: TItem) => {
    const v = valueSelector(item);
    if (v === null || v === undefined) {
      return null;
    }

    return styleFromOption(optionGetter(v as TValue));
  };
};

export const exportStyleFromOption = <TItem>(
  optionSelector: (item: TItem) => ColorLike
) => {
  return (item: TItem) => styleFromOption(optionSelector(item));
};

type HistoryEntry<T> = {
  rating?: T | null | undefined;
  testDate?: string | null | undefined;
};

export const exportStyleFromLatestHistory = <TItem, TValue>(
  historySelector: (
    item: TItem
  ) => Array<HistoryEntry<TValue> | null | undefined> | null | undefined,
  optionGetter: (
    value: NonNullable<HistoryEntry<TValue>['rating']>
  ) => ColorLike
) => {
  const ts = (d?: string | null) => (d ? Date.parse(d) : 0);

  return (item: TItem) => {
    const list = (historySelector(item) ?? []).filter(
      (e): e is HistoryEntry<TValue> => Boolean(e)
    );
    const withRating = list.filter(
      (e) => e.rating !== undefined && e.rating !== null
    );
    if (withRating.length === 0) {
      return null;
    }
    const latest = withRating.reduce((a, b) =>
      ts(b.testDate) > ts(a.testDate) ? b : a
    );
    const opt = optionGetter(
      latest.rating as NonNullable<HistoryEntry<TValue>['rating']>
    );

    return styleFromOption(opt);
  };
};
