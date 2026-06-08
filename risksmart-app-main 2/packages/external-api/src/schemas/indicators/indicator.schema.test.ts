import { describe, expect, it } from 'vitest';

import {
  IndicatorItemResponseSchema,
  IndicatorListResponseSchema,
} from './indicator.schema';

describe('IndicatorItemResponseSchema', () => {
  // Common links with results field
  const baseLinks = {
    self: {
      href: '/api/v1/indicators/123e4567-e89b-12d3-a456-426614174000',
    },
    createdBy: null,
    updatedBy: null,
    owners: [],
    contributors: [],
    results: {
      href: '/api/v1/indicators/123e4567-e89b-12d3-a456-426614174000/results',
    },
  };

  const fullLinks = {
    self: {
      href: '/api/v1/indicators/123e4567-e89b-12d3-a456-426614174000',
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
    results: {
      href: '/api/v1/indicators/123e4567-e89b-12d3-a456-426614174000/results',
    },
  };

  const baseValidIndicator = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    sequentialId: 1,
    title: 'Test Indicator',
    description: 'Test Description',
    createdAt: '2023-01-01T00:00:00.000+00:00',
    updatedAt: '2023-01-01T00:00:00.000+00:00',
    createdBy: 'provider|user123',
    updatedBy: 'provider|user123',
    owners: [],
    contributors: [],
    tags: [],
    type: 'kpi',
    unit: 'percentage',
    targetValue: '95',
    upperTolerance: 100,
    lowerTolerance: 80,
    upperAppetite: 90,
    lowerAppetite: 70,
    schedule: {
      frequency: null,
      manualDueDate: null,
      startDate: null,
      timeToCompleteUnit: null,
      timeToCompleteValue: null,
    },
    scheduleState: {
      dueDate: null,
      latestDate: null,
      overdueDate: null,
    },
    links: baseLinks,
  };

  it('should validate a valid indicator item object', () => {
    const validIndicatorItem = {
      ...baseValidIndicator,
      description: 'This is a test indicator',
      createdBy: 'provider|user123',
      updatedBy: 'provider|user456',
      owners: ['provider|owner1'],
      contributors: ['provider|contributor1'],
      tags: [
        {
          name: 'kpi',
          description: 'Key Performance Indicator',
        },
      ],
      links: fullLinks,
    };

    const result = IndicatorItemResponseSchema.safeParse(validIndicatorItem);
    expect(result.success).toBe(true);
  });

  it('should reject empty title', () => {
    const invalidIndicator = {
      ...baseValidIndicator,
      title: '',
    };

    const result = IndicatorItemResponseSchema.safeParse(invalidIndicator);
    expect(result.success).toBe(false);
  });

  it('should reject invalid UUID', () => {
    const invalidIndicator = {
      ...baseValidIndicator,
      id: 'not-a-uuid',
      links: {
        ...baseValidIndicator.links,
        self: { href: '/api/v1/indicators/not-a-uuid' },
      },
    };

    const result = IndicatorItemResponseSchema.safeParse(invalidIndicator);
    expect(result.success).toBe(false);
  });

  it('should accept null description', () => {
    const validIndicator = {
      ...baseValidIndicator,
      description: null,
    };

    const result = IndicatorItemResponseSchema.safeParse(validIndicator);
    expect(result.success).toBe(true);
  });

  it('should accept null sequentialId', () => {
    const validIndicator = {
      ...baseValidIndicator,
      sequentialId: null,
    };

    const result = IndicatorItemResponseSchema.safeParse(validIndicator);
    expect(result.success).toBe(true);
  });

  it('should reject negative sequentialId', () => {
    const invalidIndicator = {
      ...baseValidIndicator,
      sequentialId: -1,
    };

    const result = IndicatorItemResponseSchema.safeParse(invalidIndicator);
    expect(result.success).toBe(false);
  });

  it('should reject indicator with extra fields due to strict mode', () => {
    const invalidIndicator = {
      ...baseValidIndicator,
      extraField: 'should not be here',
    };

    const result = IndicatorItemResponseSchema.safeParse(invalidIndicator);
    expect(result.success).toBe(false);
  });

  it('should accept null createdBy and updatedBy', () => {
    const validIndicator = {
      ...baseValidIndicator,
      createdBy: null,
      updatedBy: null,
    };

    const result = IndicatorItemResponseSchema.safeParse(validIndicator);
    expect(result.success).toBe(true);
  });

  it('should accept empty arrays for owners, contributors, and tags', () => {
    const result = IndicatorItemResponseSchema.safeParse(baseValidIndicator);
    expect(result.success).toBe(true);
  });

  it('should accept null tolerance and appetite values', () => {
    const validIndicator = {
      ...baseValidIndicator,
      upperTolerance: null,
      lowerTolerance: null,
      upperAppetite: null,
      lowerAppetite: null,
    };

    const result = IndicatorItemResponseSchema.safeParse(validIndicator);
    expect(result.success).toBe(true);
  });

  it('should accept null unit and targetValue', () => {
    const validIndicator = {
      ...baseValidIndicator,
      unit: null,
      targetValue: null,
    };

    const result = IndicatorItemResponseSchema.safeParse(validIndicator);
    expect(result.success).toBe(true);
  });

  it('should reject invalid type format', () => {
    const invalidIndicator = {
      ...baseValidIndicator,
      type: 123, // type should be string, not number
    };

    const result = IndicatorItemResponseSchema.safeParse(invalidIndicator);
    expect(result.success).toBe(false);
  });
});

describe('IndicatorListResponseSchema', () => {
  // Common links for list items
  const baseListLinks = {
    self: {
      href: '/api/v1/indicators/123e4567-e89b-12d3-a456-426614174000',
    },
    parents: [],
    createdBy: null,
    updatedBy: null,
    owners: [],
    contributors: [],
    results: {
      href: '/api/v1/indicators/123e4567-e89b-12d3-a456-426614174000/results',
    },
  };

  const fullListLinks = {
    self: {
      href: '/api/v1/indicators/123e4567-e89b-12d3-a456-426614174000',
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
    results: {
      href: '/api/v1/indicators/123e4567-e89b-12d3-a456-426614174000/results',
    },
  };

  const baseValidIndicatorListItem = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    sequentialId: 1,
    title: 'Test Indicator',
    description: 'This is a test indicator',
    createdAt: '2023-01-01T00:00:00.000+00:00',
    updatedAt: '2023-01-02T00:00:00.000+00:00',
    createdBy: 'provider|user123',
    updatedBy: 'provider|user456',
    owners: ['provider|owner1'],
    contributors: ['provider|contributor1'],
    tags: [],
    links: baseListLinks,
  };

  it('should validate a valid indicator list item', () => {
    const validIndicatorListItem = {
      ...baseValidIndicatorListItem,
      tags: [
        {
          name: 'kpi',
          description: 'Key Performance Indicator',
        },
      ],
      links: fullListLinks,
    };

    const result = IndicatorListResponseSchema.safeParse(
      validIndicatorListItem
    );
    expect(result.success).toBe(true);
  });

  it('should accept empty parents array', () => {
    const result = IndicatorListResponseSchema.safeParse(
      baseValidIndicatorListItem
    );
    expect(result.success).toBe(true);
  });

  it('should accept null parent references', () => {
    const validIndicatorListItem = {
      ...baseValidIndicatorListItem,
      links: {
        ...baseValidIndicatorListItem.links,
        parents: [null],
      },
    };

    const result = IndicatorListResponseSchema.safeParse(
      validIndicatorListItem
    );
    expect(result.success).toBe(true);
  });

  it('should reject empty title', () => {
    const invalidIndicator = {
      ...baseValidIndicatorListItem,
      title: '',
    };

    const result = IndicatorListResponseSchema.safeParse(invalidIndicator);
    expect(result.success).toBe(false);
  });

  it('should reject invalid UUID', () => {
    const invalidIndicator = {
      ...baseValidIndicatorListItem,
      id: 'not-a-uuid',
      links: {
        ...baseValidIndicatorListItem.links,
        self: { href: '/api/v1/indicators/not-a-uuid' },
      },
    };

    const result = IndicatorListResponseSchema.safeParse(invalidIndicator);
    expect(result.success).toBe(false);
  });

  it('should reject indicator with extra fields due to strict mode', () => {
    const invalidIndicator = {
      ...baseValidIndicatorListItem,
      extraField: 'should not be here',
    };

    const result = IndicatorListResponseSchema.safeParse(invalidIndicator);
    expect(result.success).toBe(false);
  });

  it('should accept multiple parents', () => {
    const validIndicatorListItem = {
      ...baseValidIndicatorListItem,
      links: {
        ...baseValidIndicatorListItem.links,
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

    const result = IndicatorListResponseSchema.safeParse(
      validIndicatorListItem
    );
    expect(result.success).toBe(true);
  });
});
