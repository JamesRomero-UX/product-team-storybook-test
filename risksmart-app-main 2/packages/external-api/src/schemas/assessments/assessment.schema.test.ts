import { describe, expect, it } from 'vitest';

import {
  AssessmentItemResponseSchema,
  AssessmentListResponseSchema,
} from './assessment.schema';

describe('AssessmentItemResponseSchema', () => {
  const baseValidAssessment = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    sequentialId: 1,
    title: 'Test Assessment',
    description: 'Test Description',
    createdAt: '2023-01-01T00:00:00.000+00:00',
    updatedAt: '2023-01-01T00:00:00.000+00:00',
    createdBy: 'provider|user123',
    updatedBy: 'provider|user123',
    owners: [],
    contributors: [],
    tags: [],
    status: 'in-progress',
    startDate: '2023-01-01T00:00:00.000+00:00',
    endDate: '2023-12-31T00:00:00.000+00:00',
    completionDate: '2023-12-31T00:00:00.000+00:00',
    links: {
      self: {
        href: '/api/v1/assessments/123e4567-e89b-12d3-a456-426614174000',
      },
      createdBy: null,
      updatedBy: null,
      owners: [],
      contributors: [],
    },
  };

  it('should validate a valid assessment item object', () => {
    const validAssessmentItem = {
      ...baseValidAssessment,
      description: 'This is a test assessment',
      createdBy: 'provider|user123',
      updatedBy: 'provider|user456',
      owners: ['provider|owner1'],
      contributors: ['provider|contributor1'],
      tags: [
        {
          name: 'critical',
          description: 'Critical assessment',
        },
      ],
      links: {
        self: {
          href: '/api/v1/assessments/123e4567-e89b-12d3-a456-426614174000',
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

    const result = AssessmentItemResponseSchema.safeParse(validAssessmentItem);
    expect(result.success).toBe(true);
  });

  it('should reject empty title', () => {
    const invalidAssessment = {
      ...baseValidAssessment,
      title: '',
    };

    const result = AssessmentItemResponseSchema.safeParse(invalidAssessment);
    expect(result.success).toBe(false);
  });

  it('should reject invalid UUID', () => {
    const invalidAssessment = {
      ...baseValidAssessment,
      id: 'not-a-uuid',
      links: {
        ...baseValidAssessment.links,
        self: { href: '/api/v1/assessments/not-a-uuid' },
      },
    };

    const result = AssessmentItemResponseSchema.safeParse(invalidAssessment);
    expect(result.success).toBe(false);
  });

  it('should accept null description', () => {
    const validAssessment = {
      ...baseValidAssessment,
      description: null,
    };

    const result = AssessmentItemResponseSchema.safeParse(validAssessment);
    expect(result.success).toBe(true);
  });

  it('should accept null sequentialId', () => {
    const validAssessment = {
      ...baseValidAssessment,
      sequentialId: null,
    };

    const result = AssessmentItemResponseSchema.safeParse(validAssessment);
    expect(result.success).toBe(true);
  });

  it('should reject negative sequentialId', () => {
    const invalidAssessment = {
      ...baseValidAssessment,
      sequentialId: -1,
    };

    const result = AssessmentItemResponseSchema.safeParse(invalidAssessment);
    expect(result.success).toBe(false);
  });

  it('should reject assessment with extra fields due to strict mode', () => {
    const invalidAssessment = {
      ...baseValidAssessment,
      extraField: 'should not be here',
    };

    const result = AssessmentItemResponseSchema.safeParse(invalidAssessment);
    expect(result.success).toBe(false);
  });

  it('should accept null createdBy and updatedBy', () => {
    const validAssessment = {
      ...baseValidAssessment,
      createdBy: null,
      updatedBy: null,
    };

    const result = AssessmentItemResponseSchema.safeParse(validAssessment);
    expect(result.success).toBe(true);
  });

  it('should accept empty arrays for owners, contributors, and tags', () => {
    const result = AssessmentItemResponseSchema.safeParse(baseValidAssessment);
    expect(result.success).toBe(true);
  });

  it('should reject invalid date format for startDate', () => {
    const invalidAssessment = {
      ...baseValidAssessment,
      startDate: 'invalid-date',
    };

    const result = AssessmentItemResponseSchema.safeParse(invalidAssessment);
    expect(result.success).toBe(false);
  });
});

describe('AssessmentListResponseSchema', () => {
  const baseValidAssessmentListItem = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    sequentialId: 1,
    title: 'Test Assessment',
    description: 'This is a test assessment',
    createdAt: '2023-01-01T00:00:00.000+00:00',
    updatedAt: '2023-01-02T00:00:00.000+00:00',
    createdBy: 'provider|user123',
    updatedBy: 'provider|user456',
    owners: ['provider|owner1'],
    contributors: ['provider|contributor1'],
    tags: [],
    links: {
      self: {
        href: '/api/v1/assessments/123e4567-e89b-12d3-a456-426614174000',
      },
      parents: [],
      createdBy: null,
      updatedBy: null,
      owners: [],
      contributors: [],
    },
  };

  it('should validate a valid assessment list item', () => {
    const validAssessmentListItem = {
      ...baseValidAssessmentListItem,
      tags: [
        {
          name: 'critical',
          description: 'Critical assessment',
        },
      ],
      links: {
        self: {
          href: '/api/v1/assessments/123e4567-e89b-12d3-a456-426614174000',
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

    const result = AssessmentListResponseSchema.safeParse(
      validAssessmentListItem
    );
    expect(result.success).toBe(true);
  });

  it('should accept empty parents array', () => {
    const result = AssessmentListResponseSchema.safeParse(
      baseValidAssessmentListItem
    );
    expect(result.success).toBe(true);
  });

  it('should accept null parent references', () => {
    const validAssessmentListItem = {
      ...baseValidAssessmentListItem,
      links: {
        ...baseValidAssessmentListItem.links,
        parents: [null],
      },
    };

    const result = AssessmentListResponseSchema.safeParse(
      validAssessmentListItem
    );
    expect(result.success).toBe(true);
  });

  it('should reject empty title', () => {
    const invalidAssessment = {
      ...baseValidAssessmentListItem,
      title: '',
    };

    const result = AssessmentListResponseSchema.safeParse(invalidAssessment);
    expect(result.success).toBe(false);
  });

  it('should reject invalid UUID', () => {
    const invalidAssessment = {
      ...baseValidAssessmentListItem,
      id: 'not-a-uuid',
      links: {
        ...baseValidAssessmentListItem.links,
        self: { href: '/api/v1/assessments/not-a-uuid' },
      },
    };

    const result = AssessmentListResponseSchema.safeParse(invalidAssessment);
    expect(result.success).toBe(false);
  });

  it('should reject assessment with extra fields due to strict mode', () => {
    const invalidAssessment = {
      ...baseValidAssessmentListItem,
      extraField: 'should not be here',
    };

    const result = AssessmentListResponseSchema.safeParse(invalidAssessment);
    expect(result.success).toBe(false);
  });

  it('should accept multiple parents', () => {
    const validAssessmentListItem = {
      ...baseValidAssessmentListItem,
      links: {
        ...baseValidAssessmentListItem.links,
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

    const result = AssessmentListResponseSchema.safeParse(
      validAssessmentListItem
    );
    expect(result.success).toBe(true);
  });
});
