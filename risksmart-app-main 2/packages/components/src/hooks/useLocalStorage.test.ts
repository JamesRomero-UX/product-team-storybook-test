import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { type LocalStorageKeys, useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  const localStorageKey: LocalStorageKeys = 'Dashboard-Preferences';
  const orgScope = 'org1';

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should initialize with default value', () => {
    const { result } = renderHook(() =>
      useLocalStorage('default', { localStorageKey })
    );

    expect(result.current[0]).toBe('default');
  });

  it('should initialize with value from localStorage', () => {
    localStorage.setItem(localStorageKey, JSON.stringify('storedValue'));

    const { result } = renderHook(() =>
      useLocalStorage('default', { localStorageKey })
    );

    expect(result.current[0]).toBe('storedValue');
  });

  it('should update value in localStorage', () => {
    const { result } = renderHook(() =>
      useLocalStorage('default', { localStorageKey })
    );

    act(() => {
      result.current[1]('newValue');
    });

    expect(localStorage.getItem(localStorageKey)).toBe(
      JSON.stringify('newValue')
    );

    expect(result.current[0]).toBe('newValue');
  });

  it('should initialize with org-scoped value from localStorage', () => {
    const orgScopedKey = `${localStorageKey}-${orgScope}`;
    localStorage.setItem(orgScopedKey, JSON.stringify('orgStoredValue'));

    const { result } = renderHook(() =>
      useLocalStorage('default', { localStorageKey, orgScope })
    );

    expect(result.current[0]).toBe('orgStoredValue');
  });

  it('should update org-scoped value in localStorage', () => {
    const orgScopedKey = `${localStorageKey}-${orgScope}`;

    const { result } = renderHook(() =>
      useLocalStorage('default', { localStorageKey, orgScope })
    );

    act(() => {
      result.current[1]('newOrgValue');
    });

    expect(localStorage.getItem(orgScopedKey)).toBe(
      JSON.stringify('newOrgValue')
    );
    expect(result.current[0]).toBe('newOrgValue');
  });

  it('should handle errors gracefully', () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {
        // Mock implementation to suppress error logging
      });

    const { result } = renderHook(() =>
      useLocalStorage('default', { localStorageKey })
    );

    act(() => {
      result.current[1](() => {
        throw new Error('Test error');
      });
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
