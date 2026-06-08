import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { ThirdPartyContactFields } from './types';
import {
  getContactStatus,
  mapContactWithStatus,
  useContactsWithStatus,
} from './useContactsWithStatus';

const createMockContact = (
  overrides: Partial<ThirdPartyContactFields> = {}
): ThirdPartyContactFields => ({
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
  ...overrides,
});

describe('getContactStatus', () => {
  it('should return "revoked" when IsRevoked is true', () => {
    expect(getContactStatus(true, null, null)).toBe('revoked');
  });

  it('should return "revoked" when IsRevoked is true, even if lastSeen exists', () => {
    expect(getContactStatus(true, '2024-01-01T00:00:00Z', null)).toBe(
      'revoked'
    );
  });

  it('should return "active" when not revoked and lastSeen exists', () => {
    expect(getContactStatus(false, '2024-01-01T00:00:00Z', null)).toBe(
      'active'
    );
  });

  it('should return "active" when not revoked and passwordSetAt exists', () => {
    expect(getContactStatus(false, null, '2024-01-01T00:00:00Z')).toBe(
      'active'
    );
  });

  it('should return "active" when not revoked and both lastSeen and passwordSetAt exist', () => {
    expect(
      getContactStatus(false, '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z')
    ).toBe('active');
  });

  it('should return "pending" when not revoked and lastSeen is null', () => {
    expect(getContactStatus(false, null, null)).toBe('pending');
  });

  it('should return "pending" when not revoked and lastSeen is undefined', () => {
    expect(getContactStatus(false, undefined, undefined)).toBe('pending');
  });
});

describe('mapContactWithStatus', () => {
  it('should map a pending contact correctly', () => {
    const contact = createMockContact();

    const result = mapContactWithStatus(contact);

    expect(result.status).toBe('pending');
    expect(result.lastLogin).toBeNull();
    expect(result.Email).toBe('test@example.com');
  });

  it('should map an active contact correctly', () => {
    const lastSeen = '2024-01-15T10:30:00Z';
    const contact = createMockContact({
      user: { LastSeen: lastSeen },
    });

    const result = mapContactWithStatus(contact);

    expect(result.status).toBe('active');
    expect(result.lastLogin).toBe(lastSeen);
  });

  it('should map a revoked contact correctly', () => {
    const contact = createMockContact({
      IsRevoked: true,
    });

    const result = mapContactWithStatus(contact);

    expect(result.status).toBe('revoked');
    expect(result.lastLogin).toBeNull();
  });

  it('should prioritize revoked status over active', () => {
    const contact = createMockContact({
      IsRevoked: true,
      user: { LastSeen: '2024-01-15T10:30:00Z' },
    });

    const result = mapContactWithStatus(contact);

    expect(result.status).toBe('revoked');
  });

  it('should handle user being null', () => {
    const contact = createMockContact({
      user: null,
    });

    const result = mapContactWithStatus(contact);

    expect(result.lastLogin).toBeNull();
    expect(result.status).toBe('pending');
  });

  it('should handle user.LastSeen being null', () => {
    const contact = createMockContact({
      user: { LastSeen: null },
    });

    const result = mapContactWithStatus(contact);

    expect(result.lastLogin).toBeNull();
    expect(result.status).toBe('pending');
  });

  it('should return "active" when PasswordSetAtTimestamp is set but no LastSeen', () => {
    const contact = createMockContact({
      PasswordSetAtTimestamp: '2024-02-01T00:00:00Z',
      user: null,
    });

    const result = mapContactWithStatus(contact);

    expect(result.status).toBe('active');
    expect(result.lastLogin).toBeNull();
  });
});

describe('useContactsWithStatus', () => {
  it('should return empty array for empty input', () => {
    const { result } = renderHook(() => useContactsWithStatus([]));

    expect(result.current).toEqual([]);
  });

  it('should map multiple contacts with correct statuses', () => {
    const contacts: ThirdPartyContactFields[] = [
      createMockContact({ Id: 'contact-1', IsRevoked: false, user: null }),
      createMockContact({
        Id: 'contact-2',
        IsRevoked: false,
        user: { LastSeen: '2024-01-15T10:30:00Z' },
      }),
      createMockContact({ Id: 'contact-3', IsRevoked: true, user: null }),
    ];

    const { result } = renderHook(() => useContactsWithStatus(contacts));

    expect(result.current).toHaveLength(3);
    expect(result.current[0].status).toBe('pending');
    expect(result.current[1].status).toBe('active');
    expect(result.current[2].status).toBe('revoked');
  });

  it('should preserve all original contact fields', () => {
    const contact = createMockContact({
      Name: 'John Doe',
      JobTitle: 'Developer',
      Email: 'john@example.com',
    });

    const { result } = renderHook(() => useContactsWithStatus([contact]));

    expect(result.current[0].Name).toBe('John Doe');
    expect(result.current[0].JobTitle).toBe('Developer');
    expect(result.current[0].Email).toBe('john@example.com');
  });

  it('should memoize results', () => {
    const contacts = [createMockContact()];

    const { result, rerender } = renderHook(
      ({ contacts }) => useContactsWithStatus(contacts),
      { initialProps: { contacts } }
    );

    const firstResult = result.current;

    rerender({ contacts });

    expect(result.current).toBe(firstResult);
  });

  it('should return new array when contacts change', () => {
    const initialContacts = [createMockContact({ Id: 'contact-1' })];
    const newContacts = [createMockContact({ Id: 'contact-2' })];

    const { result, rerender } = renderHook(
      ({ contacts }) => useContactsWithStatus(contacts),
      { initialProps: { contacts: initialContacts } }
    );

    const firstResult = result.current;

    rerender({ contacts: newContacts });

    expect(result.current).not.toBe(firstResult);
    expect(result.current[0].Id).toBe('contact-2');
  });
});
