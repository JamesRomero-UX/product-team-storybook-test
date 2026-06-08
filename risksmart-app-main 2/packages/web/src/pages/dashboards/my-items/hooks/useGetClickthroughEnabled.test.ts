import { renderHook } from '@testing-library/react';
import type { Mock } from 'vitest';
import { describe, expect, it, vi } from 'vitest';

import { useDashboardStore } from '../../useDashboardStore';
import useGetClickthroughEnabled from './useGetClickthroughEnabled';

vi.mock('../../useDashboardStore', () => ({
  useDashboardStore: vi.fn(),
}));

describe('useGetClickthroughEnabled', () => {
  it('should return true when no inherited filters are applied', () => {
    (useDashboardStore as Mock).mockReturnValue({
      myItemsFilters: {
        inheritedOwner: false,
        inheritedContributor: false,
        inheritedGroupOwner: false,
        inheritedGroupContributor: false,
      },
    });

    const { result } = renderHook(() => useGetClickthroughEnabled());
    expect(result.current).toBe(true);
  });

  it('should return false when inheritedOwner is true', () => {
    (useDashboardStore as Mock).mockReturnValue({
      myItemsFilters: {
        inheritedOwner: true,
        inheritedContributor: false,
        inheritedGroupOwner: false,
        inheritedGroupContributor: false,
      },
    });

    const { result } = renderHook(() => useGetClickthroughEnabled());
    expect(result.current).toBe(false);
  });

  it('should return false when inheritedContributor is true', () => {
    (useDashboardStore as Mock).mockReturnValue({
      myItemsFilters: {
        inheritedOwner: false,
        inheritedContributor: true,
        inheritedGroupOwner: false,
        inheritedGroupContributor: false,
      },
    });

    const { result } = renderHook(() => useGetClickthroughEnabled());
    expect(result.current).toBe(false);
  });

  it('should return false when inheritedGroupOwner is true', () => {
    (useDashboardStore as Mock).mockReturnValue({
      myItemsFilters: {
        inheritedOwner: false,
        inheritedContributor: false,
        inheritedGroupOwner: true,
        inheritedGroupContributor: false,
      },
    });

    const { result } = renderHook(() => useGetClickthroughEnabled());
    expect(result.current).toBe(false);
  });

  it('should return false when inheritedGroupContributor is true', () => {
    (useDashboardStore as Mock).mockReturnValue({
      myItemsFilters: {
        inheritedOwner: false,
        inheritedContributor: false,
        inheritedGroupOwner: false,
        inheritedGroupContributor: true,
      },
    });

    const { result } = renderHook(() => useGetClickthroughEnabled());
    expect(result.current).toBe(false);
  });

  it('should return false when multiple inherited filters are true', () => {
    (useDashboardStore as Mock).mockReturnValue({
      myItemsFilters: {
        inheritedOwner: true,
        inheritedContributor: true,
        inheritedGroupOwner: false,
        inheritedGroupContributor: false,
      },
    });

    const { result } = renderHook(() => useGetClickthroughEnabled());
    expect(result.current).toBe(false);
  });
});
