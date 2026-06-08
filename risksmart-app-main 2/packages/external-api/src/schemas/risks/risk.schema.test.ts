import { describe, expect, it } from 'vitest';

import {
  CreateRiskSchema,
  RiskListItemSchema,
  RiskQuerySchema,
  RiskSchema,
  UpdateRiskSchema,
} from './risk.schema';

describe('RiskSchema', () => {
  it('should validate a valid risk object', () => {
    const validRisk = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      sequentialId: 1,
      title: 'Test Risk',
      description: 'This is a test risk',
      createdAt: '2023-01-01T00:00:00.000+00:00',
      updatedAt: '2023-01-01T00:00:00.000+00:00',
      createdBy: 'provider|user123',
      updatedBy: 'provider|user123',
      tier: 0,
      status: 'open',
      treatment: 'mitigate',
      owners: ['provider|user123'],
      contributors: ['provider|user456'],
      tags: [],
      riskScore: {
        residualScore: 10,
        residualRating: 3,
        inherentScore: 15,
        inherentRating: 4,
        residualImpact: 5,
        residualLikelihood: 2,
        inherentImpact: 5,
        inherentLikelihood: 3,
      },
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
      links: {
        self: { href: '/api/v1/risks/123e4567-e89b-12d3-a456-426614174000' },
        parents: [],
        controls: {
          href: '/api/v1/risks/123e4567-e89b-12d3-a456-426614174000/controls',
        },
        acceptances: {
          href: '/api/v1/risks/123e4567-e89b-12d3-a456-426614174000/acceptances',
        },
        actions: {
          href: '/api/v1/risks/123e4567-e89b-12d3-a456-426614174000/actions',
        },
        indicators: {
          href: '/api/v1/risks/123e4567-e89b-12d3-a456-426614174000/indicators',
        },
        appetites: {
          href: '/api/v1/risks/123e4567-e89b-12d3-a456-426614174000/appetites',
        },
        ratings: {
          href: '/api/v1/risks/123e4567-e89b-12d3-a456-426614174000/ratings',
        },
        impacts: {
          href: '/api/v1/risks/123e4567-e89b-12d3-a456-426614174000/impacts',
        },
        approvals: {
          href: '/api/v1/risks/123e4567-e89b-12d3-a456-426614174000/approvals',
        },
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

    const result = RiskSchema.safeParse(validRisk);
    expect(result.success).toBe(true);
  });

  it('should reject invalid severity', () => {
    const invalidRisk = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Test Risk',
      description: 'This is a test risk',
      severity: 'invalid',
      status: 'open',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      tenantId: '123e4567-e89b-12d3-a456-426614174000',
    };

    const result = RiskSchema.safeParse(invalidRisk);
    expect(result.success).toBe(false);
  });

  it('should reject empty title', () => {
    const invalidRisk = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: '',
      description: 'This is a test risk',
      severity: 'medium',
      status: 'open',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      tenantId: '123e4567-e89b-12d3-a456-426614174000',
    };

    const result = RiskSchema.safeParse(invalidRisk);
    expect(result.success).toBe(false);
  });

  it('should reject invalid UUID', () => {
    const invalidRisk = {
      id: 'not-a-uuid',
      title: 'Test Risk',
      description: 'This is a test risk',
      severity: 'medium',
      status: 'open',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      tenantId: '123e4567-e89b-12d3-a456-426614174000',
    };

    const result = RiskSchema.safeParse(invalidRisk);
    expect(result.success).toBe(false);
  });
});

describe('CreateRiskSchema', () => {
  it('should validate a valid create risk object', () => {
    const validCreateRisk = {
      sequentialId: 1,
      title: 'Test Risk',
      description: 'This is a test risk',
      createdBy: 'provider|user123',
      updatedBy: 'provider|user123',
      tier: 0,
      status: 'open',
      treatment: 'mitigate',
      owners: ['provider|user123'],
      contributors: ['provider|user456'],
      tags: [],
      riskScore: {
        residualScore: 10,
        residualRating: 3,
        inherentScore: 15,
        inherentRating: 4,
        residualImpact: 5,
        residualLikelihood: 2,
        inherentImpact: 5,
        inherentLikelihood: 3,
      },
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
      links: {
        self: { href: '/api/v1/risks/new' },
        parents: [],
        controls: { href: '/api/v1/risks/new/controls' },
        acceptances: { href: '/api/v1/risks/new/acceptances' },
        actions: { href: '/api/v1/risks/new/actions' },
        indicators: { href: '/api/v1/risks/new/indicators' },
        appetites: { href: '/api/v1/risks/new/appetites' },
        ratings: { href: '/api/v1/risks/new/ratings' },
        impacts: { href: '/api/v1/risks/new/impacts' },
        approvals: { href: '/api/v1/risks/new/approvals' },
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

    const result = CreateRiskSchema.safeParse(validCreateRisk);
    expect(result.success).toBe(true);
  });

  it('should reject create risk with id', () => {
    const invalidCreateRisk = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Test Risk',
      description: 'This is a test risk',
      severity: 'medium',
      status: 'open',
    };

    const result = CreateRiskSchema.safeParse(invalidCreateRisk);
    expect(result.success).toBe(false);
  });
});

describe('UpdateRiskSchema', () => {
  it('should validate a valid update risk object', () => {
    const validUpdateRisk = {
      title: 'Updated Risk',
      status: 'closed',
      treatment: 'accept',
    };

    const result = UpdateRiskSchema.safeParse(validUpdateRisk);
    expect(result.success).toBe(true);
  });

  it('should validate empty update risk object', () => {
    const validUpdateRisk = {};

    const result = UpdateRiskSchema.safeParse(validUpdateRisk);
    expect(result.success).toBe(true);
  });

  it('should reject update risk with id', () => {
    const invalidUpdateRisk = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Updated Risk',
    };

    const result = UpdateRiskSchema.safeParse(invalidUpdateRisk);
    expect(result.success).toBe(false);
  });
});

describe('RiskQuerySchema', () => {
  it('should validate valid query parameters', () => {
    const validQuery = {
      page: '1',
      limit: '10',
      status: 'open',
      severity: 'high',
    };

    const result = RiskQuerySchema.safeParse(validQuery);
    expect(result.success).toBe(true);
    expect(result.data?.page).toBe(1);
    expect(result.data?.limit).toBe(10);
  });

  it('should apply defaults for missing parameters', () => {
    const emptyQuery = {};

    const result = RiskQuerySchema.safeParse(emptyQuery);
    expect(result.success).toBe(true);
    expect(result.data?.page).toBe(1);
    expect(result.data?.limit).toBe(10);
  });

  it('should reject invalid page number', () => {
    const invalidQuery = {
      page: '0',
    };

    const result = RiskQuerySchema.safeParse(invalidQuery);
    expect(result.success).toBe(false);
  });

  it('should reject limit over 100', () => {
    const invalidQuery = {
      limit: '101',
    };

    const result = RiskQuerySchema.safeParse(invalidQuery);
    expect(result.success).toBe(false);
  });
});

describe('RiskListResponseSchema', () => {
  it('should validate a valid response', () => {
    const validResponse = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      sequentialId: 1,
      title: 'Test Risk',
      description: 'This is a test risk',
      createdAt: '2023-01-01T00:00:00.000+00:00',
      updatedAt: '2023-01-01T00:00:00.000+00:00',
      createdBy: 'provider|user123',
      updatedBy: 'provider|user123',
      tier: 0,
      status: 'open',
      treatment: 'mitigate',
      owners: ['provider|user123'],
      contributors: ['provider|user456'],
      tags: [],
      riskScore: {
        residualScore: 10,
        residualRating: 3,
        inherentScore: 15,
        inherentRating: 4,
        residualImpact: 5,
        residualLikelihood: 2,
        inherentImpact: 5,
        inherentLikelihood: 3,
      },
      links: {
        self: {
          href: '/api/v1/risks/123e4567-e89b-12d3-a456-426614174000',
        },
        parents: [],
        controls: {
          href: '/api/v1/risks/123e4567-e89b-12d3-a456-426614174000/controls',
        },
        acceptances: {
          href: '/api/v1/risks/123e4567-e89b-12d3-a456-426614174000/acceptances',
        },
        actions: {
          href: '/api/v1/risks/123e4567-e89b-12d3-a456-426614174000/actions',
        },
        indicators: {
          href: '/api/v1/risks/123e4567-e89b-12d3-a456-426614174000/indicators',
        },
        appetites: {
          href: '/api/v1/risks/123e4567-e89b-12d3-a456-426614174000/appetites',
        },
        ratings: {
          href: '/api/v1/risks/123e4567-e89b-12d3-a456-426614174000/ratings',
        },
        impacts: {
          href: '/api/v1/risks/123e4567-e89b-12d3-a456-426614174000/impacts',
        },
        approvals: {
          href: '/api/v1/risks/123e4567-e89b-12d3-a456-426614174000/approvals',
        },
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

    const result = RiskListItemSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
  });
});
