import { describe, expect, it } from 'vitest';

import { UserItemResponseSchema } from './user.schema';

describe('UserItemResponseSchema', () => {
  const baseValidUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    firstName: 'John',
    lastName: 'Doe',
    businessUnitId: '123e4567-e89b-12d3-a456-426614174001',
    status: 'active',
    jobTitle: 'Senior Risk Manager',
    department: 'Risk Management',
    officeLocation: 'London HQ',
    lastSeen: '2023-12-01T00:00:00.000+00:00',
    friendlyName: 'John Doe',
    links: { self: { href: '/api/v1/users/123e4567-e89b-12d3-a456-426614174000' } },
  };

  it('should validate a valid user item object', () => {
    const result = UserItemResponseSchema.safeParse(baseValidUser);
    expect(result.success).toBe(true);
  });

  it('should accept null firstName', () => {
    const validUser = {
      ...baseValidUser,
      firstName: null,
    };

    const result = UserItemResponseSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it('should accept null lastName', () => {
    const validUser = {
      ...baseValidUser,
      lastName: null,
    };

    const result = UserItemResponseSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it('should reject invalid UUID', () => {
    const invalidUser = {
      ...baseValidUser,
      id: 123,
    };

    const result = UserItemResponseSchema.safeParse(invalidUser);
    expect(result.success).toBe(false);
  });

  it('should reject user with extra fields due to strict mode', () => {
    const invalidUser = {
      ...baseValidUser,
      extraField: 'should not be here',
    };

    const result = UserItemResponseSchema.safeParse(invalidUser);
    expect(result.success).toBe(false);
  });

  it('should reject invalid businessUnitId UUID', () => {
    const invalidUser = {
      ...baseValidUser,
      businessUnitId: 'not-a-uuid',
    };

    const result = UserItemResponseSchema.safeParse(invalidUser);
    expect(result.success).toBe(false);
  });

  it('should accept null businessUnitId', () => {
    const validUser = {
      ...baseValidUser,
      businessUnitId: null,
    };

    const result = UserItemResponseSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it('should accept null status', () => {
    const validUser = {
      ...baseValidUser,
      status: null,
    };

    const result = UserItemResponseSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it('should accept null jobTitle', () => {
    const validUser = {
      ...baseValidUser,
      jobTitle: null,
    };

    const result = UserItemResponseSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it('should accept null department', () => {
    const validUser = {
      ...baseValidUser,
      department: null,
    };

    const result = UserItemResponseSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it('should accept null officeLocation', () => {
    const validUser = {
      ...baseValidUser,
      officeLocation: null,
    };

    const result = UserItemResponseSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it('should reject invalid date format for lastSeen', () => {
    const invalidUser = {
      ...baseValidUser,
      lastSeen: 'invalid-date',
    };

    const result = UserItemResponseSchema.safeParse(invalidUser);
    expect(result.success).toBe(false);
  });

  it('should reject empty friendlyName', () => {
    const invalidUser = {
      ...baseValidUser,
      friendlyName: '',
    };

    const result = UserItemResponseSchema.safeParse(invalidUser);
    expect(result.success).toBe(false);
  });

  it('should reject missing friendlyName', () => {
    const invalidUser = {
      ...baseValidUser,
      friendlyName: undefined,
    };

    const result = UserItemResponseSchema.safeParse(invalidUser);
    expect(result.success).toBe(false);
  });

  it('should accept all nullable fields as null', () => {
    const validUser = {
      ...baseValidUser,
      businessUnitId: null,
      status: null,
      jobTitle: null,
      department: null,
      officeLocation: null,
    };

    const result = UserItemResponseSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });
});
