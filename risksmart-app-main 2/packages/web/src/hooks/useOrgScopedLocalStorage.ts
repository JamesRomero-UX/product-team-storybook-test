import type { LocalStorageKeys } from '@risksmart-app/components/src/hooks/useLocalStorage';
import { useLocalStorage } from '@risksmart-app/components/src/hooks/useLocalStorage';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import type { Dispatch, SetStateAction } from 'react';
import { useMemo } from 'react';

export function useOrgScopedLocalStorage<T>(
  initialValue: T,
  { localStorageKey }: { localStorageKey?: LocalStorageKeys }
): [T, Dispatch<SetStateAction<T>>] {
  const { user } = useRisksmartUser();

  // Create a key that is scoped to the organization
  // (non-scoped storageKey is still used as a fallback).
  const orgScope = useMemo(() => {
    if (user?.orgKey) {
      return user.orgKey;
    }

    return null;
  }, [user]);

  const [storedValue, setValue] = useLocalStorage(initialValue, {
    localStorageKey,
    orgScope,
  });

  return [storedValue, setValue];
}
