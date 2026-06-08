import { renderHook } from '@testing-library/react';

import { getWrapper } from '../testing/wrapper';
import { useRating } from './useRating';

describe('useRating', () => {
  describe('provide the rating key to the hook (proactive loading)', () => {
    it('returns all options for the given rating key', () => {
      const { result } = renderHook(() => useRating('priority'), {
        wrapper: getWrapper('i18n'),
      });

      const options = result.current.options;

      expect(options).toEqual([
        { color: 'dark-green', label: 'Low', value: 1 },
        { color: 'orange', label: 'Medium', value: 2 },
        { color: 'dark-red', label: 'High', value: 3 },
      ]);
    });

    it('returns a rating by its value', () => {
      const { result } = renderHook(() => useRating('priority'), {
        wrapper: getWrapper('i18n'),
      });

      const option = result.current.getByValue(1);

      expect(option).toEqual({ color: 'dark-green', label: 'Low', value: 1 });
    });

    it('returns a rating by its label', () => {
      const { result } = renderHook(() => useRating('priority'), {
        wrapper: getWrapper('i18n'),
      });

      const option = result.current.getByLabel('Low');

      expect(option).toEqual({ color: 'dark-green', label: 'Low', value: 1 });
    });

    it('returns the label for a given value', () => {
      const { result } = renderHook(() => useRating('priority'), {
        wrapper: getWrapper('i18n'),
      });

      const label = result.current.getLabel(1);

      expect(label).toBe('Low');
    });

    it('returns the color class for a given value', () => {
      const { result } = renderHook(() => useRating('priority'), {
        wrapper: getWrapper('i18n'),
      });

      const colorClass = result.current.getColorClass(1);

      expect(colorClass).toBe('dark-green');
    });

    it('returns undefined if a rating with no range is used to getByRange', () => {
      const { result } = renderHook(() => useRating('priority'), {
        wrapper: getWrapper('i18n'),
      });

      const option = result.current.getByRange(1);

      expect(option).toBeUndefined();
    });

    it('returns a rating by its range', () => {
      const { result } = renderHook(() => useRating('effectiveness'), {
        wrapper: getWrapper('i18n'),
      });

      const option = result.current.getByRange(11);

      expect(option).toEqual({
        label: 'Mostly effective',
        color: 'light-green',
        value: 3,
        range: [8, 13],
      });
    });
  });

  describe('provide the rating key to the hooks functions (lazy loading)', () => {
    it('returns a rating by its value', () => {
      const { result } = renderHook(() => useRating(), {
        wrapper: getWrapper('i18n'),
      });

      const option = result.current.getByValueAndRatingKey('priority', 1);

      expect(option).toEqual({ color: 'dark-green', label: 'Low', value: 1 });
    });

    it('returns all options', async () => {
      const { result } = renderHook(() => useRating('priority'), {
        wrapper: getWrapper('i18n'),
      });

      const options = result.current.getOptionsByRatingKey('priority');

      expect(options).toEqual([
        {
          color: 'dark-green',
          label: 'Low',
          value: 1,
        },
        {
          color: 'orange',
          label: 'Medium',
          value: 2,
        },
        {
          color: 'dark-red',
          label: 'High',
          value: 3,
        },
      ]);
    });
  });

  describe('getLabelByIndex', () => {
    it('returns the label for a valid index', () => {
      const { result } = renderHook(() => useRating('priority'), {
        wrapper: getWrapper('i18n'),
      });

      const label = result.current.getLabelByIndex(0);

      expect(label).toBe('Low');
    });

    it('returns the label for the last valid index', () => {
      const { result } = renderHook(() => useRating('priority'), {
        wrapper: getWrapper('i18n'),
      });

      const label = result.current.getLabelByIndex(2);

      expect(label).toBe('High');
    });

    it('returns empty string for out of bounds index', () => {
      const { result } = renderHook(() => useRating('priority'), {
        wrapper: getWrapper('i18n'),
      });

      const label = result.current.getLabelByIndex(10);

      expect(label).toBe('');
    });

    it('returns empty string for negative index', () => {
      const { result } = renderHook(() => useRating('priority'), {
        wrapper: getWrapper('i18n'),
      });

      const label = result.current.getLabelByIndex(-1);

      expect(label).toBe('');
    });

    it('returns empty string when no rating key is provided', () => {
      const { result } = renderHook(() => useRating(), {
        wrapper: getWrapper('i18n'),
      });

      const label = result.current.getLabelByIndex(0);

      expect(label).toBe('');
    });
  });

  describe('getIndexByValue', () => {
    it('returns the correct index for a valid value', () => {
      const { result } = renderHook(() => useRating('priority'), {
        wrapper: getWrapper('i18n'),
      });

      const index = result.current.getIndexByValue(2);

      expect(index).toBe(1);
    });

    it('returns undefined for invalid value when pending is not supported', () => {
      const { result } = renderHook(() => useRating('priority'), {
        wrapper: getWrapper('i18n'),
      });

      const index = result.current.getIndexByValue('invalid-value');

      expect(index).toBeUndefined();
    });

    it('returns pending index when value not found and pending is supported', () => {
      // Assuming there's a rating type that supports pending
      const { result } = renderHook(() => useRating('action_status'), {
        wrapper: getWrapper('i18n'),
      });

      const index = result.current.getIndexByValue('invalid-value');

      const pendingIndex = result.current.options.findIndex(
        (option) => option.value === 'pending'
      );

      if (pendingIndex >= 0) {
        expect(index).toBe(pendingIndex);
      } else {
        expect(index).toBeUndefined();
      }
    });

    it('handles null value correctly', () => {
      const { result } = renderHook(() => useRating('priority'), {
        wrapper: getWrapper('i18n'),
      });

      const index = result.current.getIndexByValue(null);

      expect(index).toBeUndefined();
    });

    it('handles undefined value correctly', () => {
      const { result } = renderHook(() => useRating('priority'), {
        wrapper: getWrapper('i18n'),
      });

      const index = result.current.getIndexByValue(undefined);

      expect(index).toBeUndefined();
    });

    it('handles legacy dash value correctly', () => {
      const { result } = renderHook(() => useRating('priority'), {
        wrapper: getWrapper('i18n'),
      });

      const index = result.current.getIndexByValue('-');

      expect(index).toBeUndefined();
    });

    it('returns undefined when no rating key is provided', () => {
      const { result } = renderHook(() => useRating(), {
        wrapper: getWrapper('i18n'),
      });

      const index = result.current.getIndexByValue('any-value');

      expect(index).toBeUndefined();
    });
  });
});
