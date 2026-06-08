import { describe, expect, it } from 'vitest';

import {
  EnterpriseRiskItemResponseSchema,
  EnterpriseRiskListResponseSchema,
} from './enterprise-risk.schema';

describe('EnterpriseRiskItemResponseSchema', () => {
  const baseValidEnterpriseRisk = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    sequentialId: 1,
    title: 'Test Enterprise Risk',
    description: 'Test Description',
    createdAt: '2023-01-01T00:00:00.000+00:00',
    updatedAt: '2023-01-01T00:00:00.000+00:00',
    createdBy: 'provider|user123',
    updatedBy: 'provider|user123',
    owners: [],
    contributors: [],
    tags: [],
    tier: 1,
    treatment: 'accept',
    score: {
      inherentScoreMean: 75.5,
      residualScoreMean: 45.2,
      inherentRatingMean: 3.5,
      residualRatingMean: 2.1,
    },
    links: {
      self: {
        href: '/api/v1/enterprise-risks/123e4567-e89b-12d3-a456-426614174000',
      },
      createdBy: null,
      updatedBy: null,
      owners: [],
      contributors: [],
    },
  };

  it('should validate a valid enterprise risk item object', () => {
    const validEnterpriseRiskItem = {
      ...baseValidEnterpriseRisk,
      description: 'This is a test enterprise risk',
      createdBy: 'provider|user123',
      updatedBy: 'provider|user456',
      owners: ['provider|owner1'],
      contributors: ['provider|contributor1'],
      tags: [
        {
          name: 'strategic',
          description: 'Strategic risk',
        },
      ],
      links: {
        self: {
          href: '/api/v1/enterprise-risks/123e4567-e89b-12d3-a456-426614174000',
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

    const result = EnterpriseRiskItemResponseSchema.safeParse(
      validEnterpriseRiskItem
    );
    expect(result.success).toBe(true);
  });

  it('should reject empty title', () => {
    const invalidEnterpriseRisk = {
      ...baseValidEnterpriseRisk,
      title: '',
    };

    const result = EnterpriseRiskItemResponseSchema.safeParse(
      invalidEnterpriseRisk
    );
    expect(result.success).toBe(false);
  });

  it('should reject invalid UUID', () => {
    const invalidEnterpriseRisk = {
      ...baseValidEnterpriseRisk,
      id: 'not-a-uuid',
      links: {
        ...baseValidEnterpriseRisk.links,
        self: { href: '/api/v1/enterprise-risks/not-a-uuid' },
      },
    };

    const result = EnterpriseRiskItemResponseSchema.safeParse(
      invalidEnterpriseRisk
    );
    expect(result.success).toBe(false);
  });

  it('should accept null description', () => {
    const validEnterpriseRisk = {
      ...baseValidEnterpriseRisk,
      description: null,
    };

    const result =
      EnterpriseRiskItemResponseSchema.safeParse(validEnterpriseRisk);
    expect(result.success).toBe(true);
  });

  it('should accept null sequentialId', () => {
    const validEnterpriseRisk = {
      ...baseValidEnterpriseRisk,
      sequentialId: null,
    };

    const result =
      EnterpriseRiskItemResponseSchema.safeParse(validEnterpriseRisk);
    expect(result.success).toBe(true);
  });

  it('should reject negative sequentialId', () => {
    const invalidEnterpriseRisk = {
      ...baseValidEnterpriseRisk,
      sequentialId: -1,
    };

    const result = EnterpriseRiskItemResponseSchema.safeParse(
      invalidEnterpriseRisk
    );
    expect(result.success).toBe(false);
  });

  it('should reject enterprise risk with extra fields due to strict mode', () => {
    const invalidEnterpriseRisk = {
      ...baseValidEnterpriseRisk,
      extraField: 'should not be here',
    };

    const result = EnterpriseRiskItemResponseSchema.safeParse(
      invalidEnterpriseRisk
    );
    expect(result.success).toBe(false);
  });

  it('should accept null createdBy and updatedBy', () => {
    const validEnterpriseRisk = {
      ...baseValidEnterpriseRisk,
      createdBy: null,
      updatedBy: null,
    };

    const result =
      EnterpriseRiskItemResponseSchema.safeParse(validEnterpriseRisk);
    expect(result.success).toBe(true);
  });

  it('should accept empty arrays for owners, contributors, and tags', () => {
    const result = EnterpriseRiskItemResponseSchema.safeParse(
      baseValidEnterpriseRisk
    );
    expect(result.success).toBe(true);
  });

  it('should accept null treatment', () => {
    const validEnterpriseRisk = {
      ...baseValidEnterpriseRisk,
      treatment: null,
    };

    const result =
      EnterpriseRiskItemResponseSchema.safeParse(validEnterpriseRisk);
    expect(result.success).toBe(true);
  });

  it('should accept null score', () => {
    const validEnterpriseRisk = {
      ...baseValidEnterpriseRisk,
      score: null,
    };

    const result =
      EnterpriseRiskItemResponseSchema.safeParse(validEnterpriseRisk);
    expect(result.success).toBe(true);
  });

  it('should accept score with null fields', () => {
    const validEnterpriseRisk = {
      ...baseValidEnterpriseRisk,
      score: {
        inherentScoreMean: null,
        residualScoreMean: null,
        inherentRatingMean: null,
        residualRatingMean: null,
      },
    };

    const result =
      EnterpriseRiskItemResponseSchema.safeParse(validEnterpriseRisk);
    expect(result.success).toBe(true);
  });

  it('should accept score with partial null fields', () => {
    const validEnterpriseRisk = {
      ...baseValidEnterpriseRisk,
      score: {
        inherentScoreMean: 75.5,
        residualScoreMean: null,
        inherentRatingMean: 3.5,
        residualRatingMean: null,
      },
    };

    const result =
      EnterpriseRiskItemResponseSchema.safeParse(validEnterpriseRisk);
    expect(result.success).toBe(true);
  });

  it('should reject negative tier', () => {
    const invalidEnterpriseRisk = {
      ...baseValidEnterpriseRisk,
      tier: -1,
    };

    const result = EnterpriseRiskItemResponseSchema.safeParse(
      invalidEnterpriseRisk
    );
    expect(result.success).toBe(false);
  });

  it('should accept tier 0', () => {
    const validEnterpriseRisk = {
      ...baseValidEnterpriseRisk,
      tier: 0,
    };

    const result =
      EnterpriseRiskItemResponseSchema.safeParse(validEnterpriseRisk);
    expect(result.success).toBe(true);
  });

  it('should reject non-integer tier', () => {
    const invalidEnterpriseRisk = {
      ...baseValidEnterpriseRisk,
      tier: 1.5,
    };

    const result = EnterpriseRiskItemResponseSchema.safeParse(
      invalidEnterpriseRisk
    );
    expect(result.success).toBe(false);
  });

  it('should reject invalid score structure', () => {
    const invalidEnterpriseRisk = {
      ...baseValidEnterpriseRisk,
      score: {
        inherentScoreMean: 'not-a-number',
        residualScoreMean: 45.2,
        inherentRatingMean: 3.5,
        residualRatingMean: 2.1,
      },
    };

    const result = EnterpriseRiskItemResponseSchema.safeParse(
      invalidEnterpriseRisk
    );
    expect(result.success).toBe(false);
  });

  it('should accept valid tier values', () => {
    const validEnterpriseRisk = {
      ...baseValidEnterpriseRisk,
      tier: 3,
    };

    const result =
      EnterpriseRiskItemResponseSchema.safeParse(validEnterpriseRisk);
    expect(result.success).toBe(true);
  });
});

describe('EnterpriseRiskListResponseSchema', () => {
  const baseValidEnterpriseRiskListItem = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    sequentialId: 1,
    title: 'Test Enterprise Risk',
    description: 'This is a test enterprise risk',
    createdAt: '2023-01-01T00:00:00.000+00:00',
    updatedAt: '2023-01-02T00:00:00.000+00:00',
    createdBy: 'provider|user123',
    updatedBy: 'provider|user456',
    owners: ['provider|owner1'],
    contributors: ['provider|contributor1'],
    tags: [],
    tier: 2,
    treatment: 'mitigate',
    links: {
      self: {
        href: '/api/v1/enterprise-risks/123e4567-e89b-12d3-a456-426614174000',
      },
      parents: [],
      createdBy: null,
      updatedBy: null,
      owners: [],
      contributors: [],
    },
  };

  it('should validate a valid enterprise risk list item', () => {
    const validEnterpriseRiskListItem = {
      ...baseValidEnterpriseRiskListItem,
      tags: [
        {
          name: 'strategic',
          description: 'Strategic risk',
        },
      ],
      links: {
        self: {
          href: '/api/v1/enterprise-risks/123e4567-e89b-12d3-a456-426614174000',
        },
        parents: [
          {
            href: '/api/v1/enterprise-risks/123e4567-e89b-12d3-a456-426614174001',
            type: 'enterprise-risk',
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

    const result = EnterpriseRiskListResponseSchema.safeParse(
      validEnterpriseRiskListItem
    );
    expect(result.success).toBe(true);
  });

  it('should accept empty parents array', () => {
    const result = EnterpriseRiskListResponseSchema.safeParse(
      baseValidEnterpriseRiskListItem
    );
    expect(result.success).toBe(true);
  });

  it('should accept null parent references', () => {
    const validEnterpriseRiskListItem = {
      ...baseValidEnterpriseRiskListItem,
      links: {
        ...baseValidEnterpriseRiskListItem.links,
        parents: [null],
      },
    };

    const result = EnterpriseRiskListResponseSchema.safeParse(
      validEnterpriseRiskListItem
    );
    expect(result.success).toBe(true);
  });

  it('should reject empty title', () => {
    const invalidEnterpriseRisk = {
      ...baseValidEnterpriseRiskListItem,
      title: '',
    };

    const result = EnterpriseRiskListResponseSchema.safeParse(
      invalidEnterpriseRisk
    );
    expect(result.success).toBe(false);
  });

  it('should reject invalid UUID', () => {
    const invalidEnterpriseRisk = {
      ...baseValidEnterpriseRiskListItem,
      id: 'not-a-uuid',
      links: {
        ...baseValidEnterpriseRiskListItem.links,
        self: { href: '/api/v1/enterprise-risks/not-a-uuid' },
      },
    };

    const result = EnterpriseRiskListResponseSchema.safeParse(
      invalidEnterpriseRisk
    );
    expect(result.success).toBe(false);
  });

  it('should reject enterprise risk with extra fields due to strict mode', () => {
    const invalidEnterpriseRisk = {
      ...baseValidEnterpriseRiskListItem,
      extraField: 'should not be here',
    };

    const result = EnterpriseRiskListResponseSchema.safeParse(
      invalidEnterpriseRisk
    );
    expect(result.success).toBe(false);
  });

  it('should accept multiple parents', () => {
    const validEnterpriseRiskListItem = {
      ...baseValidEnterpriseRiskListItem,
      links: {
        ...baseValidEnterpriseRiskListItem.links,
        parents: [
          {
            href: '/api/v1/enterprise-risks/123e4567-e89b-12d3-a456-426614174001',
            type: 'enterprise-risk',
            id: '123e4567-e89b-12d3-a456-426614174001',
          },
          {
            href: '/api/v1/enterprise-risks/123e4567-e89b-12d3-a456-426614174002',
            type: 'enterprise-risk',
            id: '123e4567-e89b-12d3-a456-426614174002',
          },
        ],
      },
    };

    const result = EnterpriseRiskListResponseSchema.safeParse(
      validEnterpriseRiskListItem
    );
    expect(result.success).toBe(true);
  });

  it('should accept null treatment in list response', () => {
    const validEnterpriseRiskListItem = {
      ...baseValidEnterpriseRiskListItem,
      treatment: null,
    };

    const result = EnterpriseRiskListResponseSchema.safeParse(
      validEnterpriseRiskListItem
    );
    expect(result.success).toBe(true);
  });

  it('should reject negative tier in list response', () => {
    const invalidEnterpriseRisk = {
      ...baseValidEnterpriseRiskListItem,
      tier: -1,
    };

    const result = EnterpriseRiskListResponseSchema.safeParse(
      invalidEnterpriseRisk
    );
    expect(result.success).toBe(false);
  });

  it('should accept tier 0 in list response', () => {
    const validEnterpriseRiskListItem = {
      ...baseValidEnterpriseRiskListItem,
      tier: 0,
    };

    const result = EnterpriseRiskListResponseSchema.safeParse(
      validEnterpriseRiskListItem
    );
    expect(result.success).toBe(true);
  });
});
