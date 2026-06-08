import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ThirdPartyContactWithStatus } from './types';
import {
  filterRevocableContacts,
  useRevokeContacts,
  type UseRevokeContactsParams,
} from './useRevokeContacts';

const mockT = vi.fn((key: string, options?: { count: number }) =>
  options ? `${key}_${options.count}` : key
);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

const createMockContact = (
  overrides: Partial<ThirdPartyContactWithStatus> = {}
): ThirdPartyContactWithStatus => ({
  Id: 'contact-1',
  ThirdPartyId: 'third-party-1',
  Email: 'test@example.com',
  Name: 'Test Contact',
  JobTitle: 'Manager',
  IsRevoked: false,
  PasswordSetAtTimestamp: null,
  CreatedAtTimestamp: '2024-01-01T00:00:00Z',
  ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
  CreatedByUser: 'user-1',
  ModifiedByUser: 'user-1',
  user: null,
  lastLogin: null,
  status: 'pending',
  ...overrides,
});

describe('filterRevocableContacts', () => {
  it('should return empty array for empty input', () => {
    expect(filterRevocableContacts([])).toEqual([]);
  });

  it('should filter out revoked contacts', () => {
    const contacts = [
      createMockContact({ Id: 'contact-1', status: 'pending' }),
      createMockContact({ Id: 'contact-2', status: 'revoked' }),
      createMockContact({ Id: 'contact-3', status: 'active' }),
    ];

    const result = filterRevocableContacts(contacts);

    expect(result).toHaveLength(2);
    expect(result.map((c) => c.Id)).toEqual(['contact-1', 'contact-3']);
  });

  it('should return all contacts if none are revoked', () => {
    const contacts = [
      createMockContact({ Id: 'contact-1', status: 'pending' }),
      createMockContact({ Id: 'contact-2', status: 'active' }),
    ];

    const result = filterRevocableContacts(contacts);

    expect(result).toHaveLength(2);
  });

  it('should return empty array if all contacts are revoked', () => {
    const contacts = [
      createMockContact({ Id: 'contact-1', status: 'revoked' }),
      createMockContact({ Id: 'contact-2', status: 'revoked' }),
    ];

    const result = filterRevocableContacts(contacts);

    expect(result).toHaveLength(0);
  });
});

describe('useRevokeContacts', () => {
  const createMockParams = (
    overrides: Partial<UseRevokeContactsParams> = {}
  ): UseRevokeContactsParams => ({
    selectedContacts: [],
    revokeContacts: vi.fn().mockResolvedValue({}),
    addNotification: vi.fn(),
    refetchContacts: vi.fn().mockResolvedValue(undefined),
    onSuccess: vi.fn(),
    ...overrides,
  });

  it('should return empty revocableContacts for empty selection', () => {
    const params = createMockParams();

    const { result } = renderHook(() => useRevokeContacts(params));

    expect(result.current.revocableContacts).toEqual([]);
  });

  it('should filter out revoked contacts from selection', () => {
    const selectedContacts = [
      createMockContact({ Id: 'contact-1', status: 'pending' }),
      createMockContact({ Id: 'contact-2', status: 'revoked' }),
      createMockContact({ Id: 'contact-3', status: 'active' }),
    ];
    const params = createMockParams({ selectedContacts });

    const { result } = renderHook(() => useRevokeContacts(params));

    expect(result.current.revocableContacts).toHaveLength(2);
    expect(result.current.revocableContacts.map((c) => c.Id)).toEqual([
      'contact-1',
      'contact-3',
    ]);
  });

  it('should not call mutation if no revocable contacts', async () => {
    const revokeContacts = vi.fn().mockResolvedValue({});
    const params = createMockParams({
      selectedContacts: [createMockContact({ status: 'revoked' })],
      revokeContacts,
    });

    const { result } = renderHook(() => useRevokeContacts(params));

    await act(async () => {
      await result.current.handleRevokeAccess();
    });

    expect(revokeContacts).not.toHaveBeenCalled();
  });

  it('should call mutation with contact IDs on revoke', async () => {
    const revokeContacts = vi.fn().mockResolvedValue({});
    const selectedContacts = [
      createMockContact({ Id: 'contact-1', status: 'pending' }),
      createMockContact({ Id: 'contact-2', status: 'active' }),
    ];
    const params = createMockParams({ selectedContacts, revokeContacts });

    const { result } = renderHook(() => useRevokeContacts(params));

    await act(async () => {
      await result.current.handleRevokeAccess();
    });

    expect(revokeContacts).toHaveBeenCalledWith({
      variables: {
        ContactIds: ['contact-1', 'contact-2'],
      },
    });
  });

  it('should show success notification for single contact', async () => {
    const addNotification = vi.fn();
    const selectedContacts = [
      createMockContact({ Id: 'contact-1', status: 'pending' }),
    ];
    const params = createMockParams({ selectedContacts, addNotification });

    const { result } = renderHook(() => useRevokeContacts(params));

    await act(async () => {
      await result.current.handleRevokeAccess();
    });

    expect(addNotification).toHaveBeenCalledWith({
      type: 'success',
      content: 'revoke_access_success',
    });
  });

  it('should show success notification for multiple contacts', async () => {
    const addNotification = vi.fn();
    const selectedContacts = [
      createMockContact({ Id: 'contact-1', status: 'pending' }),
      createMockContact({ Id: 'contact-2', status: 'active' }),
    ];
    const params = createMockParams({ selectedContacts, addNotification });

    const { result } = renderHook(() => useRevokeContacts(params));

    await act(async () => {
      await result.current.handleRevokeAccess();
    });

    expect(mockT).toHaveBeenCalledWith('revoke_access_success_multiple', {
      count: 2,
    });
    expect(addNotification).toHaveBeenCalledWith({
      type: 'success',
      content: 'revoke_access_success_multiple_2',
    });
  });

  it('should call onSuccess callback after successful revoke', async () => {
    const onSuccess = vi.fn();
    const selectedContacts = [
      createMockContact({ Id: 'contact-1', status: 'pending' }),
    ];
    const params = createMockParams({ selectedContacts, onSuccess });

    const { result } = renderHook(() => useRevokeContacts(params));

    await act(async () => {
      await result.current.handleRevokeAccess();
    });

    expect(onSuccess).toHaveBeenCalled();
  });

  it('should call refetchContacts after successful revoke', async () => {
    const refetchContacts = vi.fn().mockResolvedValue(undefined);
    const selectedContacts = [
      createMockContact({ Id: 'contact-1', status: 'pending' }),
    ];
    const params = createMockParams({ selectedContacts, refetchContacts });

    const { result } = renderHook(() => useRevokeContacts(params));

    await act(async () => {
      await result.current.handleRevokeAccess();
    });

    expect(refetchContacts).toHaveBeenCalled();
  });

  it('should show error notification on mutation failure', async () => {
    const addNotification = vi.fn();
    const revokeContacts = vi.fn().mockRejectedValue(new Error('API Error'));
    const selectedContacts = [
      createMockContact({ Id: 'contact-1', status: 'pending' }),
    ];
    const params = createMockParams({
      selectedContacts,
      addNotification,
      revokeContacts,
    });

    const { result } = renderHook(() => useRevokeContacts(params));

    await act(async () => {
      await result.current.handleRevokeAccess();
    });

    expect(addNotification).toHaveBeenCalledWith({
      type: 'error',
      content: 'revoke_access_error',
    });
  });

  it('should not call onSuccess on mutation failure', async () => {
    const onSuccess = vi.fn();
    const revokeContacts = vi.fn().mockRejectedValue(new Error('API Error'));
    const selectedContacts = [
      createMockContact({ Id: 'contact-1', status: 'pending' }),
    ];
    const params = createMockParams({
      selectedContacts,
      onSuccess,
      revokeContacts,
    });

    const { result } = renderHook(() => useRevokeContacts(params));

    await act(async () => {
      await result.current.handleRevokeAccess();
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('should not call refetchContacts on mutation failure', async () => {
    const refetchContacts = vi.fn().mockResolvedValue(undefined);
    const revokeContacts = vi.fn().mockRejectedValue(new Error('API Error'));
    const selectedContacts = [
      createMockContact({ Id: 'contact-1', status: 'pending' }),
    ];
    const params = createMockParams({
      selectedContacts,
      refetchContacts,
      revokeContacts,
    });

    const { result } = renderHook(() => useRevokeContacts(params));

    await act(async () => {
      await result.current.handleRevokeAccess();
    });

    expect(refetchContacts).not.toHaveBeenCalled();
  });

  it('should memoize revocableContacts', () => {
    const selectedContacts = [
      createMockContact({ Id: 'contact-1', status: 'pending' }),
    ];
    const params = createMockParams({ selectedContacts });

    const { result, rerender } = renderHook(() => useRevokeContacts(params));

    const firstResult = result.current.revocableContacts;

    rerender();

    expect(result.current.revocableContacts).toBe(firstResult);
  });
});
