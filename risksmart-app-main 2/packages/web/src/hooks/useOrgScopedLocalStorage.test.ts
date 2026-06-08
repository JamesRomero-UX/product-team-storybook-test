import { useLocalStorage } from '@risksmart-app/components/src/hooks/useLocalStorage';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { act, renderHook } from '@testing-library/react';
import type { Mock } from 'vitest';
import { vi } from 'vitest';

import { useOrgScopedLocalStorage } from './useOrgScopedLocalStorage';

vi.mock('@risksmart-app/components/src/hooks/useLocalStorage');
vi.mock('@risksmart-app/components/src/hooks/useRisksmartUser');

describe('useOrgScopedLocalStorage', () => {
  const localStorageKey = 'Dashboard-Preferences';
  const orgScope = 'org1';

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should initialize with default value', () => {
    (useRisksmartUser as Mock).mockReturnValue({ user: { orgKey: orgScope } });
    (useLocalStorage as Mock).mockReturnValue(['default', vi.fn()]);

    const { result } = renderHook(() =>
      useOrgScopedLocalStorage('default', { localStorageKey })
    );

    expect(result.current[0]).toBe('default');
  });

  it('should initialize with value from localStorage', () => {
    const orgScopedKey = `${localStorageKey}-${orgScope}`;
    localStorage.setItem(orgScopedKey, JSON.stringify('storedValue'));

    (useRisksmartUser as Mock).mockReturnValue({ user: { orgKey: orgScope } });
    (useLocalStorage as Mock).mockReturnValue(['storedValue', vi.fn()]);

    const { result } = renderHook(() =>
      useOrgScopedLocalStorage('default', { localStorageKey })
    );

    expect(result.current[0]).toBe('storedValue');
  });

  it('should update value in localStorage', () => {
    const setValue = vi.fn();

    (useRisksmartUser as Mock).mockReturnValue({ user: { orgKey: orgScope } });
    (useLocalStorage as Mock).mockReturnValue(['default', setValue]);

    const { result } = renderHook(() =>
      useOrgScopedLocalStorage('default', { localStorageKey })
    );

    act(() => {
      result.current[1]('newValue');
    });

    expect(setValue).toHaveBeenCalledWith('newValue');
  });
});
