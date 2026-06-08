import { describe, expect, it } from 'vitest';

import {
  ControlItemResponseSchema,
  ControlListResponseSchema,
  ControlResponseSchema,
} from './control.schema';

describe('ControlResponseSchema', () => {
  it('should validate a valid control response object', () => {
    const validControl = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      sequentialId: 1,
      title: 'Test Control',
      description: 'This is a test control',
      createdAt: '2023-01-01T00:00:00.000+00:00',
      updatedAt: '2023-01-01T00:00:00.000+00:00',
      createdBy: 'provider|user123',
      updatedBy: 'provider|user123',
      owners: ['provider|user123'],
      contributors: ['provider|user456'],
      tags: [
        {
          name: 'security',
          description: 'Security related control',
        },
      ],
    };

    const result = ControlResponseSchema.safeParse(validControl);
    expect(result.success).toBe(true);
  });

  it('should validate control with null description', () => {
    const validControl = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      sequentialId: 1,
      title: 'Test Control',
      description: null,
      createdAt: '2023-01-01T00:00:00.000+00:00',
      updatedAt: '2023-01-01T00:00:00.000+00:00',
      createdBy: 'provider|user123',
      updatedBy: 'provider|user123',
      owners: ['provider|user123'],
      contributors: [],
      tags: [],
    };

    const result = ControlResponseSchema.safeParse(validControl);
    expect(result.success).toBe(true);
  });

  it('should validate control with null sequentialId', () => {
    const validControl = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      sequentialId: null,
      title: 'Test Control',
      description: 'Test description',
      createdAt: '2023-01-01T00:00:00.000+00:00',
      updatedAt: '2023-01-01T00:00:00.000+00:00',
      createdBy: 'provider|user123',
      updatedBy: null,
      owners: [],
      contributors: [],
      tags: [],
    };

    const result = ControlResponseSchema.safeParse(validControl);
    expect(result.success).toBe(true);
  });

  it('should reject control with empty title', () => {
    const invalidControl = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      sequentialId: 1,
      title: '',
      description: 'This is a test control',
      createdAt: '2023-01-01T00:00:00.000+00:00',
      updatedAt: '2023-01-01T00:00:00.000+00:00',
      createdBy: 'provider|user123',
      updatedBy: 'provider|user123',
      owners: [],
      contributors: [],
      tags: [],
    };

    const result = ControlResponseSchema.safeParse(invalidControl);
    expect(result.success).toBe(false);
  });

  it('should reject control with invalid UUID', () => {
    const invalidControl = {
      id: 'not-a-uuid',
      sequentialId: 1,
      title: 'Test Control',
      description: 'This is a test control',
      createdAt: '2023-01-01T00:00:00.000+00:00',
      updatedAt: '2023-01-01T00:00:00.000+00:00',
      createdBy: 'provider|user123',
      updatedBy: 'provider|user123',
      owners: [],
      contributors: [],
      tags: [],
    };

    const result = ControlResponseSchema.safeParse(invalidControl);
    expect(result.success).toBe(false);
  });

  it('should reject control with negative sequentialId', () => {
    const invalidControl = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      sequentialId: -1,
      title: 'Test Control',
      description: 'This is a test control',
      createdAt: '2023-01-01T00:00:00.000+00:00',
      updatedAt: '2023-01-01T00:00:00.000+00:00',
      createdBy: 'provider|user123',
      updatedBy: 'provider|user123',
      owners: [],
      contributors: [],
      tags: [],
    };

    const result = ControlResponseSchema.safeParse(invalidControl);
    expect(result.success).toBe(false);
  });

  it('should reject control with invalid provider scoped user ID', () => {
    const invalidControl = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      sequentialId: 1,
      title: 'Test Control',
      description: 'This is a test control',
      createdAt: '2023-01-01T00:00:00.000+00:00',
      updatedAt: '2023-01-01T00:00:00.000+00:00',
      createdBy: 123,
      updatedBy: 'provider|user123',
      owners: [],
      contributors: [],
      tags: [],
    };

    const result = ControlResponseSchema.safeParse(invalidControl);
    expect(result.success).toBe(false);
  });

  it('should reject control with invalid date format', () => {
    const invalidControl = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      sequentialId: 1,
      title: 'Test Control',
      description: 'This is a test control',
      createdAt: 'invalid-date',
      updatedAt: '2023-01-01T00:00:00.000+00:00',
      createdBy: 'provider|user123',
      updatedBy: 'provider|user123',
      owners: [],
      contributors: [],
      tags: [],
    };

    const result = ControlResponseSchema.safeParse(invalidControl);
    expect(result.success).toBe(false);
  });
});

describe('ControlListResponseSchema', () => {
  it('should validate a valid control list response object', () => {
    const validControlList = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      sequentialId: 1,
      title: 'Test Control',
      description: 'This is a test control',
      createdAt: '2023-01-01T00:00:00.000+00:00',
      updatedAt: '2023-01-01T00:00:00.000+00:00',
      createdBy: 'provider|user123',
      updatedBy: 'provider|user123',
      owners: ['provider|user123'],
      contributors: ['provider|user456'],
      tags: [
        {
          name: 'security',
          description: 'Security related control',
        },
      ],
      links: {
        self: { href: '/api/v1/controls/123e4567-e89b-12d3-a456-426614174000' },
        parents: [
          {
            href: '/api/v1/risks/parent-id',
            type: 'risk',
            id: 'provider|parent-id',
          },
          null,
        ],
        createdBy: {
          href: '/api/v1/users/user123',
          type: 'user',
          id: 'provider|user123',
        },
        updatedBy: {
          href: '/api/v1/users/user123',
          type: 'user',
          id: 'provider|user123',
        },
        owners: [
          {
            href: '/api/v1/users/user123',
            type: 'user',
            id: 'provider|user123',
          },
        ],
        contributors: [
          {
            href: '/api/v1/users/user456',
            type: 'user',
            id: 'provider|user456',
          },
        ],
      },
    };

    const result = ControlListResponseSchema.safeParse(validControlList);
    expect(result.success).toBe(true);
  });

  it('should validate control list with null createdBy and updatedBy links', () => {
    const validControlList = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      sequentialId: 1,
      title: 'Test Control',
      description: 'This is a test control',
      createdAt: '2023-01-01T00:00:00.000+00:00',
      updatedAt: '2023-01-01T00:00:00.000+00:00',
      createdBy: null,
      updatedBy: null,
      owners: [],
      contributors: [],
      tags: [],
      links: {
        self: { href: '/api/v1/controls/123e4567-e89b-12d3-a456-426614174000' },
        parents: [],
        createdBy: null,
        updatedBy: null,
        owners: [],
        contributors: [],
      },
    };

    const result = ControlListResponseSchema.safeParse(validControlList);
    expect(result.success).toBe(true);
  });

  it('should validate control list with empty parents array', () => {
    const validControlList = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      sequentialId: 1,
      title: 'Test Control',
      description: 'Test description',
      createdAt: '2023-01-01T00:00:00.000+00:00',
      updatedAt: '2023-01-01T00:00:00.000+00:00',
      createdBy: 'provider|user123',
      updatedBy: 'provider|user123',
      owners: ['provider|user123'],
      contributors: [],
      tags: [],
      links: {
        self: { href: '/api/v1/controls/123e4567-e89b-12d3-a456-426614174000' },
        parents: [],
        createdBy: {
          href: '/api/v1/users/user123',
          type: 'user',
          id: 'provider|user123',
        },
        updatedBy: {
          href: '/api/v1/users/user123',
          type: 'user',
          id: 'provider|user123',
        },
        owners: [
          {
            href: '/api/v1/users/user123',
            type: 'user',
            id: 'provider|user123',
          },
        ],
        contributors: [],
      },
    };

    const result = ControlListResponseSchema.safeParse(validControlList);
    expect(result.success).toBe(true);
  });

  it('should reject control list with missing links object', () => {
    const invalidControlList = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      sequentialId: 1,
      title: 'Test Control',
      description: 'This is a test control',
      createdAt: '2023-01-01T00:00:00.000+00:00',
      updatedAt: '2023-01-01T00:00:00.000+00:00',
      createdBy: 'provider|user123',
      updatedBy: 'provider|user123',
      owners: [],
      contributors: [],
      tags: [],
    };

    const result = ControlListResponseSchema.safeParse(invalidControlList);
    expect(result.success).toBe(false);
  });

  it('should reject control list with missing self link', () => {
    const invalidControlList = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      sequentialId: 1,
      title: 'Test Control',
      description: 'This is a test control',
      createdAt: '2023-01-01T00:00:00.000+00:00',
      updatedAt: '2023-01-01T00:00:00.000+00:00',
      createdBy: 'provider|user123',
      updatedBy: 'provider|user123',
      owners: [],
      contributors: [],
      tags: [],
      links: {
        parents: [],
        createdBy: null,
        updatedBy: null,
        owners: [],
        contributors: [],
      },
    };

    const result = ControlListResponseSchema.safeParse(invalidControlList);
    expect(result.success).toBe(false);
  });

  it('should reject control list with invalid parent reference', () => {
    const invalidControlList = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      sequentialId: 1,
      title: 'Test Control',
      description: 'This is a test control',
      createdAt: '2023-01-01T00:00:00.000+00:00',
      updatedAt: '2023-01-01T00:00:00.000+00:00',
      createdBy: 'provider|user123',
      updatedBy: 'provider|user123',
      owners: [],
      contributors: [],
      tags: [],
      links: {
        self: { href: '/api/v1/controls/123e4567-e89b-12d3-a456-426614174000' },
        parents: [
          {
            href: '/api/v1/risks/parent-id',
            type: 'risk',
            id: null,
          },
        ],
        createdBy: null,
        updatedBy: null,
        owners: [],
        contributors: [],
      },
    };

    const result = ControlListResponseSchema.safeParse(invalidControlList);
    expect(result.success).toBe(false);
  });
});

describe('ControlItemResponseSchema', () => {
  it('should validate a valid control item response object', () => {
    const validControlItem = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      sequentialId: 1,
      title: 'Test Control',
      description: 'This is a test control',
      type: 'manual',
      createdAt: '2023-01-01T00:00:00.000+00:00',
      updatedAt: '2023-01-01T00:00:00.000+00:00',
      createdBy: 'provider|user123',
      updatedBy: 'provider|user123',
      owners: ['provider|user123'],
      contributors: ['provider|user456'],
      tags: [
        {
          name: 'security',
          description: 'Security related control',
        },
      ],
      ancestorContributors: [
        {
          id: '456e7890-e12b-34c5-d678-901234567890',
          objectType: 'risk',
          contributorType: 'owner',
          ancestorId: '789e0123-e45b-67c8-d901-234567890123',
          userGroupId: 'group-123',
          user: {
            href: '/api/v1/users/user123',
            type: 'user',
            id: 'provider|user123',
          },
        },
        {
          id: null,
          objectType: null,
          contributorType: 'contributor',
          ancestorId: null,
          userGroupId: null,
          user: null,
        },
      ],
      links: {
        self: { href: '/api/v1/controls/123e4567-e89b-12d3-a456-426614174000' },
        createdBy: {
          href: '/api/v1/users/user123',
          type: 'user',
          id: 'provider|user123',
        },
        updatedBy: {
          href: '/api/v1/users/user123',
          type: 'user',
          id: 'provider|user123',
        },
        owners: [
          {
            href: '/api/v1/users/user123',
            type: 'user',
            id: 'provider|user123',
          },
        ],
        contributors: [
          {
            href: '/api/v1/users/user456',
            type: 'user',
            id: 'provider|user456',
          },
        ],
      },
    };

    const result = ControlItemResponseSchema.safeParse(validControlItem);
    expect(result.success).toBe(true);
  });

  it('should validate control item with null type', () => {
    const validControlItem = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      sequentialId: 1,
      title: 'Test Control',
      description: 'This is a test control',
      type: null,
      createdAt: '2023-01-01T00:00:00.000+00:00',
      updatedAt: '2023-01-01T00:00:00.000+00:00',
      createdBy: 'provider|user123',
      updatedBy: 'provider|user123',
      owners: [],
      contributors: [],
      tags: [],
      ancestorContributors: [],
      links: {
        self: { href: '/api/v1/controls/123e4567-e89b-12d3-a456-426614174000' },
        createdBy: {
          href: '/api/v1/users/user123',
          type: 'user',
          id: 'provider|user123',
        },
        updatedBy: {
          href: '/api/v1/users/user123',
          type: 'user',
          id: 'provider|user123',
        },
        owners: [],
        contributors: [],
      },
    };

    const result = ControlItemResponseSchema.safeParse(validControlItem);
    expect(result.success).toBe(true);
  });

  it('should validate control item with empty ancestorContributors', () => {
    const validControlItem = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      sequentialId: 1,
      title: 'Test Control',
      description: 'Test description',
      type: 'automated',
      createdAt: '2023-01-01T00:00:00.000+00:00',
      updatedAt: '2023-01-01T00:00:00.000+00:00',
      createdBy: 'provider|user123',
      updatedBy: 'provider|user123',
      owners: ['provider|user123'],
      contributors: [],
      tags: [],
      ancestorContributors: [],
      links: {
        self: { href: '/api/v1/controls/123e4567-e89b-12d3-a456-426614174000' },
        createdBy: {
          href: '/api/v1/users/user123',
          type: 'user',
          id: 'provider|user123',
        },
        updatedBy: {
          href: '/api/v1/users/user123',
          type: 'user',
          id: 'provider|user123',
        },
        owners: [
          {
            href: '/api/v1/users/user123',
            type: 'user',
            id: 'provider|user123',
          },
        ],
        contributors: [],
      },
    };

    const result = ControlItemResponseSchema.safeParse(validControlItem);
    expect(result.success).toBe(true);
  });

  it('should reject control item with missing links object', () => {
    const invalidControlItem = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      sequentialId: 1,
      title: 'Test Control',
      description: 'This is a test control',
      type: 'manual',
      createdAt: '2023-01-01T00:00:00.000+00:00',
      updatedAt: '2023-01-01T00:00:00.000+00:00',
      createdBy: 'provider|user123',
      updatedBy: 'provider|user123',
      owners: [],
      contributors: [],
      tags: [],
      ancestorContributors: [],
    };

    const result = ControlItemResponseSchema.safeParse(invalidControlItem);
    expect(result.success).toBe(false);
  });

  it('should reject control item with missing ancestorContributors', () => {
    const invalidControlItem = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      sequentialId: 1,
      title: 'Test Control',
      description: 'This is a test control',
      type: 'manual',
      createdAt: '2023-01-01T00:00:00.000+00:00',
      updatedAt: '2023-01-01T00:00:00.000+00:00',
      createdBy: 'provider|user123',
      updatedBy: 'provider|user123',
      owners: [],
      contributors: [],
      tags: [],
      links: {
        self: { href: '/api/v1/controls/123e4567-e89b-12d3-a456-426614174000' },
        createdBy: {
          href: '/api/v1/users/user123',
          type: 'user',
          id: 'provider|user123',
        },
        updatedBy: {
          href: '/api/v1/users/user123',
          type: 'user',
          id: 'provider|user123',
        },
        owners: [],
        contributors: [],
      },
    };

    const result = ControlItemResponseSchema.safeParse(invalidControlItem);
    expect(result.success).toBe(false);
  });

  it('should reject control item with invalid ancestorContributor UUID', () => {
    const invalidControlItem = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      sequentialId: 1,
      title: 'Test Control',
      description: 'This is a test control',
      type: 'manual',
      createdAt: '2023-01-01T00:00:00.000+00:00',
      updatedAt: '2023-01-01T00:00:00.000+00:00',
      createdBy: 'provider|user123',
      updatedBy: 'provider|user123',
      owners: [],
      contributors: [],
      tags: [],
      ancestorContributors: [
        {
          id: 'invalid-uuid',
          objectType: 'risk',
          contributorType: 'owner',
          ancestorId: '789e0123-e45b-67c8-d901-234567890123',
          userGroupId: null,
          user: null,
        },
      ],
      links: {
        self: { href: '/api/v1/controls/123e4567-e89b-12d3-a456-426614174000' },
        createdBy: {
          href: '/api/v1/users/user123',
          type: 'user',
          id: 'provider|user123',
        },
        updatedBy: {
          href: '/api/v1/users/user123',
          type: 'user',
          id: 'provider|user123',
        },
        owners: [],
        contributors: [],
      },
    };

    const result = ControlItemResponseSchema.safeParse(invalidControlItem);
    expect(result.success).toBe(false);
  });

  it('should reject control item with invalid user reference in ancestorContributor', () => {
    const invalidControlItem = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      sequentialId: 1,
      title: 'Test Control',
      description: 'This is a test control',
      type: 'manual',
      createdAt: '2023-01-01T00:00:00.000+00:00',
      updatedAt: '2023-01-01T00:00:00.000+00:00',
      createdBy: 'provider|user123',
      updatedBy: 'provider|user123',
      owners: [],
      contributors: [],
      tags: [],
      ancestorContributors: [
        {
          id: '456e7890-e12b-34c5-d678-901234567890',
          objectType: 'risk',
          contributorType: 'owner',
          ancestorId: '789e0123-e45b-67c8-d901-234567890123',
          userGroupId: null,
          user: {
            href: '/api/v1/users/user123',
            type: 'user',
            id: 1234567,
          },
        },
      ],
      links: {
        self: { href: '/api/v1/controls/123e4567-e89b-12d3-a456-426614174000' },
        createdBy: {
          href: '/api/v1/users/user123',
          type: 'user',
          id: 'provider|user123',
        },
        updatedBy: {
          href: '/api/v1/users/user123',
          type: 'user',
          id: 'provider|user123',
        },
        owners: [],
        contributors: [],
      },
    };

    const result = ControlItemResponseSchema.safeParse(invalidControlItem);
    expect(result.success).toBe(false);
  });
});
