import { describe, expect, it } from 'vitest';

import {
  ObligationItemResponseSchema,
  ObligationListResponseSchema,
} from './obligation.schema';

describe('ObligationItemResponseSchema', () => {
  const baseValidObligation = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    sequentialId: 1,
    title: 'Test Obligation',
    description: 'Test Description',
    createdAt: '2023-01-01T00:00:00.000+00:00',
    updatedAt: '2023-01-01T00:00:00.000+00:00',
    createdBy: 'provider|user123',
    updatedBy: 'provider|user123',
    owners: [],
    contributors: [],
    tags: [],
    type: 'regulatory',
    interpretation: 'Financial Conduct Authority interpretation',
    adherence: 'GDPR compliance requirements',
    links: {
      self: {
        href: '/api/v1/obligations/123e4567-e89b-12d3-a456-426614174000',
      },
      createdBy: null,
      updatedBy: null,
      owners: [],
      contributors: [],
    },
  };

  it('should validate a valid obligation item object', () => {
    const validObligationItem = {
      ...baseValidObligation,
      description: 'This is a test obligation',
      createdBy: 'provider|user123',
      updatedBy: 'provider|user456',
      owners: ['provider|owner1'],
      contributors: ['provider|contributor1'],
      tags: [
        {
          name: 'compliance',
          description: 'Compliance obligation',
        },
      ],
      links: {
        self: {
          href: '/api/v1/obligations/123e4567-e89b-12d3-a456-426614174000',
        },
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

    const result = ObligationItemResponseSchema.safeParse(validObligationItem);
    expect(result.success).toBe(true);
  });

  it('should reject empty title', () => {
    const invalidObligation = {
      ...baseValidObligation,
      title: '',
    };

    const result = ObligationItemResponseSchema.safeParse(invalidObligation);
    expect(result.success).toBe(false);
  });

  it('should reject invalid UUID', () => {
    const invalidObligation = {
      ...baseValidObligation,
      id: 'not-a-uuid',
      links: {
        ...baseValidObligation.links,
        self: { href: '/api/v1/obligations/not-a-uuid' },
      },
    };

    const result = ObligationItemResponseSchema.safeParse(invalidObligation);
    expect(result.success).toBe(false);
  });

  it('should accept null description', () => {
    const validObligation = {
      ...baseValidObligation,
      description: null,
    };

    const result = ObligationItemResponseSchema.safeParse(validObligation);
    expect(result.success).toBe(true);
  });

  it('should accept null sequentialId', () => {
    const validObligation = {
      ...baseValidObligation,
      sequentialId: null,
    };

    const result = ObligationItemResponseSchema.safeParse(validObligation);
    expect(result.success).toBe(true);
  });

  it('should reject negative sequentialId', () => {
    const invalidObligation = {
      ...baseValidObligation,
      sequentialId: -1,
    };

    const result = ObligationItemResponseSchema.safeParse(invalidObligation);
    expect(result.success).toBe(false);
  });

  it('should reject obligation with extra fields due to strict mode', () => {
    const invalidObligation = {
      ...baseValidObligation,
      extraField: 'should not be here',
    };

    const result = ObligationItemResponseSchema.safeParse(invalidObligation);
    expect(result.success).toBe(false);
  });

  it('should accept null createdBy and updatedBy', () => {
    const validObligation = {
      ...baseValidObligation,
      createdBy: null,
      updatedBy: null,
    };

    const result = ObligationItemResponseSchema.safeParse(validObligation);
    expect(result.success).toBe(true);
  });

  it('should accept empty arrays for owners, contributors, and tags', () => {
    const result = ObligationItemResponseSchema.safeParse(baseValidObligation);
    expect(result.success).toBe(true);
  });

  it('should accept null interpretation', () => {
    const validObligation = {
      ...baseValidObligation,
      interpretation: null,
    };

    const result = ObligationItemResponseSchema.safeParse(validObligation);
    expect(result.success).toBe(true);
  });

  it('should reject empty type', () => {
    const invalidObligation = {
      ...baseValidObligation,
      type: '',
    };

    const result = ObligationItemResponseSchema.safeParse(invalidObligation);
    expect(result.success).toBe(false);
  });

  it('should reject empty adherence', () => {
    const invalidObligation = {
      ...baseValidObligation,
      adherence: '',
    };

    const result = ObligationItemResponseSchema.safeParse(invalidObligation);
    expect(result.success).toBe(false);
  });
});

describe('ObligationListResponseSchema', () => {
  const baseValidObligationListItem = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    sequentialId: 1,
    title: 'Test Obligation',
    description: 'This is a test obligation',
    createdAt: '2023-01-01T00:00:00.000+00:00',
    updatedAt: '2023-01-02T00:00:00.000+00:00',
    createdBy: 'provider|user123',
    updatedBy: 'provider|user456',
    owners: ['provider|owner1'],
    contributors: ['provider|contributor1'],
    tags: [],
    links: {
      self: {
        href: '/api/v1/obligations/123e4567-e89b-12d3-a456-426614174000',
      },
      parents: [],
      createdBy: null,
      updatedBy: null,
      owners: [],
      contributors: [],
    },
  };

  it('should validate a valid obligation list item', () => {
    const validObligationListItem = {
      ...baseValidObligationListItem,
      tags: [
        {
          name: 'compliance',
          description: 'Compliance obligation',
        },
      ],
      links: {
        self: {
          href: '/api/v1/obligations/123e4567-e89b-12d3-a456-426614174000',
        },
        parents: [
          {
            href: '/api/v1/risks/123e4567-e89b-12d3-a456-426614174001',
            type: 'risk',
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

    const result = ObligationListResponseSchema.safeParse(
      validObligationListItem
    );
    expect(result.success).toBe(true);
  });

  it('should accept empty parents array', () => {
    const result = ObligationListResponseSchema.safeParse(
      baseValidObligationListItem
    );
    expect(result.success).toBe(true);
  });

  it('should accept null parent references', () => {
    const validObligationListItem = {
      ...baseValidObligationListItem,
      links: {
        ...baseValidObligationListItem.links,
        parents: [null],
      },
    };

    const result = ObligationListResponseSchema.safeParse(
      validObligationListItem
    );
    expect(result.success).toBe(true);
  });

  it('should reject empty title', () => {
    const invalidObligation = {
      ...baseValidObligationListItem,
      title: '',
    };

    const result = ObligationListResponseSchema.safeParse(invalidObligation);
    expect(result.success).toBe(false);
  });

  it('should reject invalid UUID', () => {
    const invalidObligation = {
      ...baseValidObligationListItem,
      id: 'not-a-uuid',
      links: {
        ...baseValidObligationListItem.links,
        self: { href: '/api/v1/obligations/not-a-uuid' },
      },
    };

    const result = ObligationListResponseSchema.safeParse(invalidObligation);
    expect(result.success).toBe(false);
  });

  it('should reject obligation with extra fields due to strict mode', () => {
    const invalidObligation = {
      ...baseValidObligationListItem,
      extraField: 'should not be here',
    };

    const result = ObligationListResponseSchema.safeParse(invalidObligation);
    expect(result.success).toBe(false);
  });

  it('should accept multiple parents', () => {
    const validObligationListItem = {
      ...baseValidObligationListItem,
      links: {
        ...baseValidObligationListItem.links,
        parents: [
          {
            href: '/api/v1/risks/123e4567-e89b-12d3-a456-426614174001',
            type: 'risk',
            id: '123e4567-e89b-12d3-a456-426614174001',
          },
          {
            href: '/api/v1/controls/123e4567-e89b-12d3-a456-426614174002',
            type: 'control',
            id: '123e4567-e89b-12d3-a456-426614174002',
          },
        ],
      },
    };

    const result = ObligationListResponseSchema.safeParse(
      validObligationListItem
    );
    expect(result.success).toBe(true);
  });
});
