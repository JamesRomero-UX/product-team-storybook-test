import { renderHook } from '@testing-library/react';
import { getWrapper } from 'src/testing/wrapper';

import { useCommonLookupLazy } from './useCommonLookupLazy';

describe('useCommonLookupLazy', () => {
  describe('getByValue', () => {
    it('returns a rating by its string value', () => {
      const { result } = renderHook(() => useCommonLookupLazy(), {
        wrapper: getWrapper([], 'i18n'),
      });
      const option = result.current.getByValue('statuses', 'active');
      expect(option).toEqual({ label: 'Active', value: 'active' });
    });
    it('returns a rating by its number value', () => {
      const { result } = renderHook(() => useCommonLookupLazy(), {
        wrapper: getWrapper([], 'i18n'),
      });
      const option = result.current.getByValue('tiers', 1);
      expect(option).toEqual({ label: 'Tier 1', value: '1' });
    });

    it('returns undefined when value not found', () => {
      const { result } = renderHook(() => useCommonLookupLazy(), {
        wrapper: getWrapper([], 'i18n'),
      });
      const option = result.current.getByValue('statuses', null);
      expect(option).toEqual(undefined);
    });
  });

  describe('getOptions', () => {
    it('returns all options', () => {
      const { result } = renderHook(() => useCommonLookupLazy(), {
        wrapper: getWrapper([], 'i18n'),
      });
      const options = result.current.getOptions('statuses');

      expect(options).toEqual([
        { value: 'active', label: 'Active' },
        { value: 'emerging', label: 'Emerging' },
        { value: 'monitored', label: 'Monitored' },
        { value: 'retired', label: 'Retired' },
      ]);
    });
  });
});
