import { describe, expect, it } from 'vitest';

import {
  ActionItemResponseSchema,
  ActionListResponseSchema,
} from './action.schema';

describe('ActionItemResponseSchema', () => {
  const baseValidAction = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    sequentialId: 1,
    title: 'Test Action',
    description: 'Test Description',
    createdAt: '2023-01-01T00:00:00.000+00:00',
    updatedAt: '2023-01-01T00:00:00.000+00:00',
    createdBy: 'provider|user123',
    updatedBy: 'provider|user123',
    owners: [],
    contributors: [],
    tags: [],
    status: 'open',
    priority: 1,
    links: {
      self: { href: '/api/v1/actions/123e4567-e89b-12d3-a456-426614174000' },
      createdBy: null,
      updatedBy: null,
      owners: [],
      contributors: [],
    },
  };

  it('should validate a valid action item object', () => {
    const validActionItem = {
      ...baseValidAction,
      description: 'This is a test action',
      createdBy: 'provider|user123',
      updatedBy: 'provider|user456',
      owners: ['provider|owner1'],
      contributors: ['provider|contributor1'],
      tags: [
        {
          name: 'urgent',
          description: 'Urgent action',
        },
      ],
      links: {
        self: { href: '/api/v1/actions/123e4567-e89b-12d3-a456-426614174000' },
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

    const result = ActionItemResponseSchema.safeParse(validActionItem);
    expect(result.success).toBe(true);
  });

  it('should reject empty title', () => {
    const invalidAction = {
      ...baseValidAction,
      title: '',
    };

    const result = ActionItemResponseSchema.safeParse(invalidAction);
    expect(result.success).toBe(false);
  });

  it('should reject invalid UUID', () => {
    const invalidAction = {
      ...baseValidAction,
      id: 'not-a-uuid',
      links: {
        ...baseValidAction.links,
        self: { href: '/api/v1/actions/not-a-uuid' },
      },
    };

    const result = ActionItemResponseSchema.safeParse(invalidAction);
    expect(result.success).toBe(false);
  });

  it('should accept null priority', () => {
    const validAction = {
      ...baseValidAction,
      priority: null,
    };

    const result = ActionItemResponseSchema.safeParse(validAction);
    expect(result.success).toBe(true);
  });

  it('should accept null description', () => {
    const validAction = {
      ...baseValidAction,
      description: null,
    };

    const result = ActionItemResponseSchema.safeParse(validAction);
    expect(result.success).toBe(true);
  });

  it('should accept null sequentialId', () => {
    const validAction = {
      ...baseValidAction,
      sequentialId: null,
    };

    const result = ActionItemResponseSchema.safeParse(validAction);
    expect(result.success).toBe(true);
  });

  it('should reject negative priority', () => {
    const invalidAction = {
      ...baseValidAction,
      priority: -1,
    };

    const result = ActionItemResponseSchema.safeParse(invalidAction);
    expect(result.success).toBe(false);
  });

  it('should reject negative sequentialId', () => {
    const invalidAction = {
      ...baseValidAction,
      sequentialId: -1,
    };

    const result = ActionItemResponseSchema.safeParse(invalidAction);
    expect(result.success).toBe(false);
  });

  it('should reject action with extra fields due to strict mode', () => {
    const invalidAction = {
      ...baseValidAction,
      extraField: 'should not be here',
    };

    const result = ActionItemResponseSchema.safeParse(invalidAction);
    expect(result.success).toBe(false);
  });

  it('should accept null createdBy and updatedBy', () => {
    const validAction = {
      ...baseValidAction,
      createdBy: null,
      updatedBy: null,
    };

    const result = ActionItemResponseSchema.safeParse(validAction);
    expect(result.success).toBe(true);
  });

  it('should accept empty arrays for owners, contributors, and tags', () => {
    const result = ActionItemResponseSchema.safeParse(baseValidAction);
    expect(result.success).toBe(true);
  });

  it('should accept multiple owners and contributors', () => {
    const validAction = {
      ...baseValidAction,
      owners: ['provider|owner1', 'provider|owner2', 'provider|owner3'],
      contributors: [
        'provider|contributor1',
        'provider|contributor2',
        'provider|contributor3',
      ],
    };

    const result = ActionItemResponseSchema.safeParse(validAction);
    expect(result.success).toBe(true);
  });
});

describe('ActionListResponseSchema', () => {
  const baseValidActionListItem = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    sequentialId: 1,
    title: 'Test Action',
    description: 'This is a test action',
    createdAt: '2023-01-01T00:00:00.000+00:00',
    updatedAt: '2023-01-02T00:00:00.000+00:00',
    createdBy: 'provider|user123',
    updatedBy: 'provider|user456',
    owners: ['provider|owner1'],
    contributors: ['provider|contributor1'],
    tags: [],
    status: 'open',
    links: {
      self: { href: '/api/v1/actions/123e4567-e89b-12d3-a456-426614174000' },
      parents: [],
      createdBy: null,
      updatedBy: null,
      owners: [],
      contributors: [],
    },
  };

  it('should validate a valid action list item', () => {
    const validActionListItem = {
      ...baseValidActionListItem,
      tags: [
        {
          name: 'urgent',
          description: 'Urgent action',
        },
      ],
      links: {
        self: { href: '/api/v1/actions/123e4567-e89b-12d3-a456-426614174000' },
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

    const result = ActionListResponseSchema.safeParse(validActionListItem);
    expect(result.success).toBe(true);
  });

  it('should accept empty parents array', () => {
    const result = ActionListResponseSchema.safeParse(baseValidActionListItem);
    expect(result.success).toBe(true);
  });

  it('should accept null parent references', () => {
    const validActionListItem = {
      ...baseValidActionListItem,
      links: {
        ...baseValidActionListItem.links,
        parents: [null],
      },
    };

    const result = ActionListResponseSchema.safeParse(validActionListItem);
    expect(result.success).toBe(true);
  });

  it('should reject empty title', () => {
    const invalidAction = {
      ...baseValidActionListItem,
      title: '',
    };

    const result = ActionListResponseSchema.safeParse(invalidAction);
    expect(result.success).toBe(false);
  });

  it('should reject invalid UUID', () => {
    const invalidAction = {
      ...baseValidActionListItem,
      id: 'not-a-uuid',
      links: {
        ...baseValidActionListItem.links,
        self: { href: '/api/v1/actions/not-a-uuid' },
      },
    };

    const result = ActionListResponseSchema.safeParse(invalidAction);
    expect(result.success).toBe(false);
  });

  it('should reject action with extra fields due to strict mode', () => {
    const invalidAction = {
      ...baseValidActionListItem,
      extraField: 'should not be here',
    };

    const result = ActionListResponseSchema.safeParse(invalidAction);
    expect(result.success).toBe(false);
  });

  it('should accept multiple parents', () => {
    const validActionListItem = {
      ...baseValidActionListItem,
      links: {
        ...baseValidActionListItem.links,
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

    const result = ActionListResponseSchema.safeParse(validActionListItem);
    expect(result.success).toBe(true);
  });
});
