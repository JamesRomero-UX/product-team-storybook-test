import { describe, expect, it } from 'vitest';

import {
  PolicyItemResponseSchema,
  PolicyListResponseSchema,
} from './policy.schema';

describe('PolicyItemResponseSchema', () => {
  const baseValidPolicy = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    sequentialId: 1,
    title: 'Test Policy',
    description: 'Test Description',
    createdAt: '2023-01-01T00:00:00.000+00:00',
    updatedAt: '2023-01-01T00:00:00.000+00:00',
    createdBy: 'provider|user123',
    updatedBy: 'provider|user123',
    owners: [],
    contributors: [],
    tags: [],
    type: 'policy-type',
    links: {
      self: { href: '/api/v1/policies/123e4567-e89b-12d3-a456-426614174000' },
      createdBy: null,
      updatedBy: null,
      owners: [],
      contributors: [],
    },
  };

  it('should validate a valid policy item object', () => {
    const validPolicyItem = {
      ...baseValidPolicy,
      description: 'This is a test policy',
      createdBy: 'provider|user123',
      updatedBy: 'provider|user456',
      owners: ['provider|owner1'],
      contributors: ['provider|contributor1'],
      tags: [
        {
          name: 'compliance',
          description: 'Compliance policy',
        },
      ],
      type: 'governance',
      links: {
        self: { href: '/api/v1/policies/123e4567-e89b-12d3-a456-426614174000' },
        createdBy: {
          href: '/api/v1/users/user123',
          type: 'user',
          id: 'provider|user123',
        },
        updatedBy: {
          href: '/api/v1/users/user456',
          type: 'user',
          id: 'provider|user456',
        },
        owners: [
          {
            href: '/api/v1/users/owner1',
            type: 'user',
            id: 'provider|owner1',
          },
        ],
        contributors: [
          {
            href: '/api/v1/users/contributor1',
            type: 'user',
            id: 'provider|contributor1',
          },
        ],
      },
    };

    const result = PolicyItemResponseSchema.safeParse(validPolicyItem);
    expect(result.success).toBe(true);
  });

  it('should reject empty title', () => {
    const invalidPolicy = {
      ...baseValidPolicy,
      title: '',
    };

    const result = PolicyItemResponseSchema.safeParse(invalidPolicy);
    expect(result.success).toBe(false);
  });

  it('should reject invalid UUID', () => {
    const invalidPolicy = {
      ...baseValidPolicy,
      id: 'not-a-uuid',
      links: {
        ...baseValidPolicy.links,
        self: { href: '/api/v1/policies/not-a-uuid' },
      },
    };

    const result = PolicyItemResponseSchema.safeParse(invalidPolicy);
    expect(result.success).toBe(false);
  });

  it('should accept null type', () => {
    const validPolicy = {
      ...baseValidPolicy,
      type: null,
    };

    const result = PolicyItemResponseSchema.safeParse(validPolicy);
    expect(result.success).toBe(true);
  });

  it('should accept null description', () => {
    const validPolicy = {
      ...baseValidPolicy,
      description: null,
    };

    const result = PolicyItemResponseSchema.safeParse(validPolicy);
    expect(result.success).toBe(true);
  });

  it('should accept null sequentialId', () => {
    const validPolicy = {
      ...baseValidPolicy,
      sequentialId: null,
    };

    const result = PolicyItemResponseSchema.safeParse(validPolicy);
    expect(result.success).toBe(true);
  });

  it('should reject negative sequentialId', () => {
    const invalidPolicy = {
      ...baseValidPolicy,
      sequentialId: -1,
    };

    const result = PolicyItemResponseSchema.safeParse(invalidPolicy);
    expect(result.success).toBe(false);
  });

  it('should reject policy with extra fields due to strict mode', () => {
    const invalidPolicy = {
      ...baseValidPolicy,
      extraField: 'should not be here',
    };

    const result = PolicyItemResponseSchema.safeParse(invalidPolicy);
    expect(result.success).toBe(false);
  });

  it('should accept null createdBy and updatedBy', () => {
    const validPolicy = {
      ...baseValidPolicy,
      createdBy: null,
      updatedBy: null,
    };

    const result = PolicyItemResponseSchema.safeParse(validPolicy);
    expect(result.success).toBe(true);
  });

  it('should accept empty arrays for owners, contributors, and tags', () => {
    const result = PolicyItemResponseSchema.safeParse(baseValidPolicy);
    expect(result.success).toBe(true);
  });

  it('should accept multiple owners and contributors', () => {
    const validPolicy = {
      ...baseValidPolicy,
      owners: ['provider|owner1', 'provider|owner2', 'provider|owner3'],
      contributors: [
        'provider|contributor1',
        'provider|contributor2',
        'provider|contributor3',
      ],
    };

    const result = PolicyItemResponseSchema.safeParse(validPolicy);
    expect(result.success).toBe(true);
  });
});

describe('PolicyListResponseSchema', () => {
  const baseValidPolicyListItem = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    sequentialId: 1,
    title: 'Test Policy',
    description: 'This is a test policy',
    createdAt: '2023-01-01T00:00:00.000+00:00',
    updatedAt: '2023-01-02T00:00:00.000+00:00',
    createdBy: 'provider|user123',
    updatedBy: 'provider|user456',
    owners: ['provider|owner1'],
    contributors: ['provider|contributor1'],
    tags: [],
    links: {
      self: { href: '/api/v1/policies/123e4567-e89b-12d3-a456-426614174000' },
      parents: [],
      createdBy: null,
      updatedBy: null,
      owners: [],
      contributors: [],
    },
  };

  it('should validate a valid policy list item', () => {
    const validPolicyListItem = {
      ...baseValidPolicyListItem,
      tags: [
        {
          name: 'compliance',
          description: 'Compliance policy',
        },
      ],
      links: {
        self: { href: '/api/v1/policies/123e4567-e89b-12d3-a456-426614174000' },
        parents: [
          {
            href: '/api/v1/policies/123e4567-e89b-12d3-a456-426614174001',
            type: 'policy',
            id: '123e4567-e89b-12d3-a456-426614174001',
          },
        ],
        createdBy: {
          href: '/api/v1/users/user123',
          type: 'user',
          id: 'provider|user123',
        },
        updatedBy: {
          href: '/api/v1/users/user456',
          type: 'user',
          id: 'provider|user456',
        },
        owners: [
          {
            href: '/api/v1/users/owner1',
            type: 'user',
            id: 'provider|owner1',
          },
        ],
        contributors: [
          {
            href: '/api/v1/users/contributor1',
            type: 'user',
            id: 'provider|contributor1',
          },
        ],
      },
    };

    const result = PolicyListResponseSchema.safeParse(validPolicyListItem);
    expect(result.success).toBe(true);
  });

  it('should accept empty parents array', () => {
    const result = PolicyListResponseSchema.safeParse(baseValidPolicyListItem);
    expect(result.success).toBe(true);
  });

  it('should accept null parent references', () => {
    const validPolicyListItem = {
      ...baseValidPolicyListItem,
      links: {
        ...baseValidPolicyListItem.links,
        parents: [null],
      },
    };

    const result = PolicyListResponseSchema.safeParse(validPolicyListItem);
    expect(result.success).toBe(true);
  });

  it('should reject empty title', () => {
    const invalidPolicy = {
      ...baseValidPolicyListItem,
      title: '',
    };

    const result = PolicyListResponseSchema.safeParse(invalidPolicy);
    expect(result.success).toBe(false);
  });

  it('should reject invalid UUID', () => {
    const invalidPolicy = {
      ...baseValidPolicyListItem,
      id: 'not-a-uuid',
      links: {
        ...baseValidPolicyListItem.links,
        self: { href: '/api/v1/policies/not-a-uuid' },
      },
    };

    const result = PolicyListResponseSchema.safeParse(invalidPolicy);
    expect(result.success).toBe(false);
  });

  it('should reject policy with extra fields due to strict mode', () => {
    const invalidPolicy = {
      ...baseValidPolicyListItem,
      extraField: 'should not be here',
    };

    const result = PolicyListResponseSchema.safeParse(invalidPolicy);
    expect(result.success).toBe(false);
  });

  it('should accept multiple parents', () => {
    const validPolicyListItem = {
      ...baseValidPolicyListItem,
      links: {
        ...baseValidPolicyListItem.links,
        parents: [
          {
            href: '/api/v1/policies/123e4567-e89b-12d3-a456-426614174001',
            type: 'policy',
            id: '123e4567-e89b-12d3-a456-426614174001',
          },
          {
            href: '/api/v1/policies/123e4567-e89b-12d3-a456-426614174002',
            type: 'policy',
            id: '123e4567-e89b-12d3-a456-426614174002',
          },
        ],
      },
    };

    const result = PolicyListResponseSchema.safeParse(validPolicyListItem);
    expect(result.success).toBe(true);
  });
});
