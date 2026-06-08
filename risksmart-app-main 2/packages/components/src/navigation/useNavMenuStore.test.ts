import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useNavMenuStore } from './useNavMenuStore';

const STORAGE_KEY = 'NavMenu-Preferences';

describe('useNavMenuStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Reset store to initial state using setState directly (not wrapped in act)
    useNavMenuStore.setState({
      isNavigationOpen: true,
    });
  });

  describe('Initial State', () => {
    it('should initialize with navigation open by default', () => {
      const { result } = renderHook(() => useNavMenuStore());

      expect(result.current.isNavigationOpen).toBe(true);
    });

    it('should read from localStorage on first access after storage update', () => {
      const { result } = renderHook(() => useNavMenuStore());

      // Set a value in storage
      act(() => {
        result.current.setNavigationOpen(false);
      });

      expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(false));
      expect(result.current.isNavigationOpen).toBe(false);

      // Simulate a fresh access by getting state directly
      const state = useNavMenuStore.getState();
      expect(state.isNavigationOpen).toBe(false);
    });

    it('should handle localStorage errors during initialization gracefully', () => {
      // Mock getItem to throw error
      const getItemSpy = vi
        .spyOn(Storage.prototype, 'getItem')
        .mockImplementation(() => {
          throw new Error('Storage access denied');
        });

      // Store should still initialize with default value
      const { result } = renderHook(() => useNavMenuStore());
      expect(result.current.isNavigationOpen).toBe(true);

      getItemSpy.mockRestore();
    });
  });

  describe('setNavigationOpen', () => {
    it('should set navigation to open', () => {
      const { result } = renderHook(() => useNavMenuStore());

      act(() => {
        result.current.setNavigationOpen(false);
      });

      expect(result.current.isNavigationOpen).toBe(false);

      act(() => {
        result.current.setNavigationOpen(true);
      });

      expect(result.current.isNavigationOpen).toBe(true);
    });

    it('should persist navigation state to localStorage', () => {
      const { result } = renderHook(() => useNavMenuStore());

      act(() => {
        result.current.setNavigationOpen(false);
      });

      expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(false));

      act(() => {
        result.current.setNavigationOpen(true);
      });

      expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(true));
    });

    it('should handle localStorage errors gracefully', () => {
      const { result } = renderHook(() => useNavMenuStore());

      // Mock localStorage.setItem to throw error
      const setItemSpy = vi
        .spyOn(Storage.prototype, 'setItem')
        .mockImplementation(() => {
          throw new Error('Storage quota exceeded');
        });

      // Should not throw error
      act(() => {
        result.current.setNavigationOpen(false);
      });

      // State should still be updated even if storage fails
      expect(result.current.isNavigationOpen).toBe(false);

      setItemSpy.mockRestore();
    });
  });

  describe('State Persistence', () => {
    it('should maintain state across multiple updates', () => {
      const { result } = renderHook(() => useNavMenuStore());

      act(() => {
        result.current.setNavigationOpen(false);
      });
      expect(result.current.isNavigationOpen).toBe(false);

      act(() => {
        result.current.setNavigationOpen(true);
      });
      expect(result.current.isNavigationOpen).toBe(true);

      act(() => {
        result.current.setNavigationOpen(false);
      });
      expect(result.current.isNavigationOpen).toBe(false);

      // Verify final localStorage state
      expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(false));
    });

    it('should sync state with localStorage', () => {
      const { result } = renderHook(() => useNavMenuStore());

      act(() => {
        result.current.setNavigationOpen(false);
      });

      // Verify both state and storage are in sync
      expect(result.current.isNavigationOpen).toBe(false);
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toBe(false);

      act(() => {
        result.current.setNavigationOpen(true);
      });

      // Verify both state and storage are in sync
      expect(result.current.isNavigationOpen).toBe(true);
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toBe(true);
    });
  });

  describe('Store Direct Access', () => {
    it('should allow direct state access via getState', () => {
      const { result } = renderHook(() => useNavMenuStore());

      act(() => {
        result.current.setNavigationOpen(false);
      });

      const state = useNavMenuStore.getState();
      expect(state.isNavigationOpen).toBe(false);
    });

    it('should allow direct state updates via setState', () => {
      const { result } = renderHook(() => useNavMenuStore());

      act(() => {
        useNavMenuStore.setState({ isNavigationOpen: false });
      });

      expect(result.current.isNavigationOpen).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid successive updates', () => {
      const { result } = renderHook(() => useNavMenuStore());

      act(() => {
        result.current.setNavigationOpen(false);
        result.current.setNavigationOpen(true);
        result.current.setNavigationOpen(false);
        result.current.setNavigationOpen(true);
      });

      expect(result.current.isNavigationOpen).toBe(true);
      expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(true));
    });

    it('should handle boolean edge cases', () => {
      const { result } = renderHook(() => useNavMenuStore());

      // Explicitly test both boolean values
      act(() => {
        result.current.setNavigationOpen(false);
      });
      expect(result.current.isNavigationOpen).toBe(false);

      act(() => {
        result.current.setNavigationOpen(true);
      });
      expect(result.current.isNavigationOpen).toBe(true);
    });

    it('should preserve state when toggling multiple times', () => {
      const { result } = renderHook(() => useNavMenuStore());

      // Start with true
      expect(result.current.isNavigationOpen).toBe(true);

      // Toggle closed
      act(() => {
        result.current.setNavigationOpen(false);
      });
      expect(result.current.isNavigationOpen).toBe(false);
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toBe(false);

      // Toggle back open
      act(() => {
        result.current.setNavigationOpen(true);
      });
      expect(result.current.isNavigationOpen).toBe(true);
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toBe(true);

      // Close again
      act(() => {
        result.current.setNavigationOpen(false);
      });
      expect(result.current.isNavigationOpen).toBe(false);
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toBe(false);
    });

    it('should handle setting the same value multiple times', () => {
      const { result } = renderHook(() => useNavMenuStore());

      act(() => {
        result.current.setNavigationOpen(false);
      });
      expect(result.current.isNavigationOpen).toBe(false);

      // Set to false again
      act(() => {
        result.current.setNavigationOpen(false);
      });
      expect(result.current.isNavigationOpen).toBe(false);
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toBe(false);
    });
  });
});
