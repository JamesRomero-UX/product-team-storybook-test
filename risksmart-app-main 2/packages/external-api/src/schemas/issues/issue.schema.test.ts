import { describe, expect, it } from 'vitest';

import {
  IssueItemResponseSchema,
  IssueListResponseSchema,
} from './issue.schema';

describe('IssueItemResponseSchema', () => {
  const baseValidIssue = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    sequentialId: 1,
    title: 'Test Issue',
    description: 'Test Description',
    createdAt: '2023-01-01T00:00:00.000+00:00',
    updatedAt: '2023-01-01T00:00:00.000+00:00',
    createdBy: 'provider|user123',
    updatedBy: 'provider|user123',
    owners: [],
    contributors: [],
    tags: [],
    dateOccurred: '2023-01-01T00:00:00.000+00:00',
    dateIdentified: '2023-01-01T00:00:00.000+00:00',
    dateRaised: '2023-01-01T00:00:00.000+00:00',
    type: 'incident',
    isExternalIssue: false,
    impactsCustomer: false,
    links: {
      self: { href: '/api/v1/issues/123e4567-e89b-12d3-a456-426614174000' },
      createdBy: null,
      updatedBy: null,
      owners: [],
      contributors: [],
      actions: {
        href: '/api/v1/issues/123e4567-e89b-12d3-a456-426614174000/actions',
      },
      assessment: {
        href: '/api/v1/issues/123e4567-e89b-12d3-a456-426614174000/assessment',
      },
      causes: {
        href: '/api/v1/issues/123e4567-e89b-12d3-a456-426614174000/causes',
      },
      consequences: {
        href: '/api/v1/issues/123e4567-e89b-12d3-a456-426614174000/consequences',
      },
      updates: {
        href: '/api/v1/issues/123e4567-e89b-12d3-a456-426614174000/updates',
      },
    },
  };

  describe('happy path', () => {
    it('should validate a valid issue item object', () => {
      const validIssueItem = {
        ...baseValidIssue,
        description: 'This is a test issue',
        createdBy: 'provider|user123',
        updatedBy: 'provider|user456',
        owners: ['provider|owner1'],
        contributors: ['provider|contributor1'],
        tags: [
          {
            name: 'urgent',
            description: 'Urgent issue',
          },
        ],
        type: 'security',
        isExternalIssue: true,
        links: {
          ...baseValidIssue.links,
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

      const result = IssueItemResponseSchema.safeParse(validIssueItem);
      expect(result.success).toBe(true);
    });

    it('should accept null description', () => {
      const validIssue = {
        ...baseValidIssue,
        description: null,
      };

      const result = IssueItemResponseSchema.safeParse(validIssue);
      expect(result.success).toBe(true);
    });

    it('should accept null sequentialId', () => {
      const validIssue = {
        ...baseValidIssue,
        sequentialId: null,
      };

      const result = IssueItemResponseSchema.safeParse(validIssue);
      expect(result.success).toBe(true);
    });

    it('should accept null createdBy and updatedBy', () => {
      const validIssue = {
        ...baseValidIssue,
        createdBy: null,
        updatedBy: null,
      };

      const result = IssueItemResponseSchema.safeParse(validIssue);
      expect(result.success).toBe(true);
    });

    it('should accept null dateRaised', () => {
      const validIssue = {
        ...baseValidIssue,
        dateRaised: null,
      };

      const result = IssueItemResponseSchema.safeParse(validIssue);
      expect(result.success).toBe(true);
    });

    it('should accept null type', () => {
      const validIssue = {
        ...baseValidIssue,
        type: null,
      };

      const result = IssueItemResponseSchema.safeParse(validIssue);
      expect(result.success).toBe(true);
    });

    it('should accept isExternalIssue as true', () => {
      const validIssue = {
        ...baseValidIssue,
        isExternalIssue: true,
      };

      const result = IssueItemResponseSchema.safeParse(validIssue);
      expect(result.success).toBe(true);
    });

    it('should accept isExternalIssue as false', () => {
      const validIssue = {
        ...baseValidIssue,
        isExternalIssue: false,
      };

      const result = IssueItemResponseSchema.safeParse(validIssue);
      expect(result.success).toBe(true);
    });

    it('should accept empty arrays for owners, contributors, and tags', () => {
      const result = IssueItemResponseSchema.safeParse(baseValidIssue);
      expect(result.success).toBe(true);
    });

    it('should accept multiple owners and contributors', () => {
      const validIssue = {
        ...baseValidIssue,
        owners: ['provider|owner1', 'provider|owner2', 'provider|owner3'],
        contributors: [
          'provider|contributor1',
          'provider|contributor2',
          'provider|contributor3',
        ],
      };

      const result = IssueItemResponseSchema.safeParse(validIssue);
      expect(result.success).toBe(true);
    });

    it('should accept multiple tags', () => {
      const validIssue = {
        ...baseValidIssue,
        tags: [
          { name: 'urgent', description: 'Urgent issue' },
          { name: 'security', description: 'Security related' },
          { name: 'compliance', description: 'Compliance related' },
        ],
      };

      const result = IssueItemResponseSchema.safeParse(validIssue);
      expect(result.success).toBe(true);
    });
  });

  describe('unhappy path', () => {
    it('should reject empty title', () => {
      const invalidIssue = {
        ...baseValidIssue,
        title: '',
      };

      const result = IssueItemResponseSchema.safeParse(invalidIssue);
      expect(result.success).toBe(false);
    });

    it('should reject invalid UUID', () => {
      const invalidIssue = {
        ...baseValidIssue,
        id: 'not-a-uuid',
        links: {
          ...baseValidIssue.links,
          self: { href: '/api/v1/issues/not-a-uuid' },
        },
      };

      const result = IssueItemResponseSchema.safeParse(invalidIssue);
      expect(result.success).toBe(false);
    });

    it('should reject negative sequentialId', () => {
      const invalidIssue = {
        ...baseValidIssue,
        sequentialId: -1,
      };

      const result = IssueItemResponseSchema.safeParse(invalidIssue);
      expect(result.success).toBe(false);
    });

    it('should reject issue with extra fields due to strict mode', () => {
      const invalidIssue = {
        ...baseValidIssue,
        extraField: 'should not be here',
      };

      const result = IssueItemResponseSchema.safeParse(invalidIssue);
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const invalidIssue = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Issue',
        // missing other required fields
      };

      const result = IssueItemResponseSchema.safeParse(invalidIssue);
      expect(result.success).toBe(false);
    });

    it('should reject invalid date format for createdAt', () => {
      const invalidIssue = {
        ...baseValidIssue,
        createdAt: 'invalid-date',
      };

      const result = IssueItemResponseSchema.safeParse(invalidIssue);
      expect(result.success).toBe(false);
    });

    it('should reject invalid date format for updatedAt', () => {
      const invalidIssue = {
        ...baseValidIssue,
        updatedAt: 'invalid-date',
      };

      const result = IssueItemResponseSchema.safeParse(invalidIssue);
      expect(result.success).toBe(false);
    });

    it('should reject invalid date format for dateOccurred', () => {
      const invalidIssue = {
        ...baseValidIssue,
        dateOccurred: 'invalid-date',
      };

      const result = IssueItemResponseSchema.safeParse(invalidIssue);
      expect(result.success).toBe(false);
    });

    it('should reject invalid date format for dateIdentified', () => {
      const invalidIssue = {
        ...baseValidIssue,
        dateIdentified: 'invalid-date',
      };

      const result = IssueItemResponseSchema.safeParse(invalidIssue);
      expect(result.success).toBe(false);
    });

    it('should reject invalid date format for dateRaised', () => {
      const invalidIssue = {
        ...baseValidIssue,
        dateRaised: 'invalid-date',
      };

      const result = IssueItemResponseSchema.safeParse(invalidIssue);
      expect(result.success).toBe(false);
    });

    it('should reject missing dateOccurred', () => {
      const invalidIssue = {
        ...baseValidIssue,
      };
      delete (invalidIssue as Record<string, unknown>).dateOccurred;

      const result = IssueItemResponseSchema.safeParse(invalidIssue);
      expect(result.success).toBe(false);
    });

    it('should reject missing dateIdentified', () => {
      const invalidIssue = {
        ...baseValidIssue,
      };
      delete (invalidIssue as Record<string, unknown>).dateIdentified;

      const result = IssueItemResponseSchema.safeParse(invalidIssue);
      expect(result.success).toBe(false);
    });

    it('should reject missing isExternalIssue', () => {
      const invalidIssue = {
        ...baseValidIssue,
      };
      delete (invalidIssue as Record<string, unknown>).isExternalIssue;

      const result = IssueItemResponseSchema.safeParse(invalidIssue);
      expect(result.success).toBe(false);
    });

    it('should reject non-boolean isExternalIssue', () => {
      const invalidIssue = {
        ...baseValidIssue,
        isExternalIssue: 'true',
      };

      const result = IssueItemResponseSchema.safeParse(invalidIssue);
      expect(result.success).toBe(false);
    });
  });
});

describe('IssueListResponseSchema', () => {
  const baseValidIssueListItem = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    sequentialId: 1,
    title: 'Test Issue',
    description: 'This is a test issue',
    createdAt: '2023-01-01T00:00:00.000+00:00',
    updatedAt: '2023-01-02T00:00:00.000+00:00',
    createdBy: 'provider|user123',
    updatedBy: 'provider|user456',
    owners: ['provider|owner1'],
    contributors: ['provider|contributor1'],
    tags: [],
    links: {
      self: { href: '/api/v1/issues/123e4567-e89b-12d3-a456-426614174000' },
      parents: [],
      createdBy: null,
      updatedBy: null,
      owners: [],
      contributors: [],
      actions: {
        href: '/api/v1/issues/123e4567-e89b-12d3-a456-426614174000/actions',
      },
      assessment: {
        href: '/api/v1/issues/123e4567-e89b-12d3-a456-426614174000/assessment',
      },
      causes: {
        href: '/api/v1/issues/123e4567-e89b-12d3-a456-426614174000/causes',
      },
      consequences: {
        href: '/api/v1/issues/123e4567-e89b-12d3-a456-426614174000/consequences',
      },
      updates: {
        href: '/api/v1/issues/123e4567-e89b-12d3-a456-426614174000/updates',
      },
    },
  };

  describe('happy path', () => {
    it('should validate a valid issue list item', () => {
      const validIssueListItem = {
        ...baseValidIssueListItem,
        tags: [
          {
            name: 'urgent',
            description: 'Urgent issue',
          },
        ],
        links: {
          ...baseValidIssueListItem.links,
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

      const result = IssueListResponseSchema.safeParse(validIssueListItem);
      expect(result.success).toBe(true);
    });

    it('should accept empty parents array', () => {
      const result = IssueListResponseSchema.safeParse(baseValidIssueListItem);
      expect(result.success).toBe(true);
    });

    it('should accept null parent references', () => {
      const validIssueListItem = {
        ...baseValidIssueListItem,
        links: {
          ...baseValidIssueListItem.links,
          parents: [null],
        },
      };

      const result = IssueListResponseSchema.safeParse(validIssueListItem);
      expect(result.success).toBe(true);
    });

    it('should accept multiple parents', () => {
      const validIssueListItem = {
        ...baseValidIssueListItem,
        links: {
          ...baseValidIssueListItem.links,
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

      const result = IssueListResponseSchema.safeParse(validIssueListItem);
      expect(result.success).toBe(true);
    });

    it('should accept mixed null and valid parent references', () => {
      const validIssueListItem = {
        ...baseValidIssueListItem,
        links: {
          ...baseValidIssueListItem.links,
          parents: [
            {
              href: '/api/v1/risks/123e4567-e89b-12d3-a456-426614174001',
              type: 'risk',
              id: '123e4567-e89b-12d3-a456-426614174001',
            },
            null,
            {
              href: '/api/v1/controls/123e4567-e89b-12d3-a456-426614174002',
              type: 'control',
              id: '123e4567-e89b-12d3-a456-426614174002',
            },
          ],
        },
      };

      const result = IssueListResponseSchema.safeParse(validIssueListItem);
      expect(result.success).toBe(true);
    });

    it('should accept null description', () => {
      const validIssue = {
        ...baseValidIssueListItem,
        description: null,
      };

      const result = IssueListResponseSchema.safeParse(validIssue);
      expect(result.success).toBe(true);
    });
  });

  describe('unhappy path', () => {
    it('should reject empty title', () => {
      const invalidIssue = {
        ...baseValidIssueListItem,
        title: '',
      };

      const result = IssueListResponseSchema.safeParse(invalidIssue);
      expect(result.success).toBe(false);
    });

    it('should reject invalid UUID', () => {
      const invalidIssue = {
        ...baseValidIssueListItem,
        id: 'not-a-uuid',
        links: {
          ...baseValidIssueListItem.links,
          self: { href: '/api/v1/issues/not-a-uuid' },
        },
      };

      const result = IssueListResponseSchema.safeParse(invalidIssue);
      expect(result.success).toBe(false);
    });

    it('should reject issue with extra fields due to strict mode', () => {
      const invalidIssue = {
        ...baseValidIssueListItem,
        extraField: 'should not be here',
      };

      const result = IssueListResponseSchema.safeParse(invalidIssue);
      expect(result.success).toBe(false);
    });

    it('should reject negative sequentialId', () => {
      const invalidIssue = {
        ...baseValidIssueListItem,
        sequentialId: -1,
      };

      const result = IssueListResponseSchema.safeParse(invalidIssue);
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const invalidIssue = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Issue',
        // missing other required fields
      };

      const result = IssueListResponseSchema.safeParse(invalidIssue);
      expect(result.success).toBe(false);
    });

    it('should reject invalid date format for createdAt', () => {
      const invalidIssue = {
        ...baseValidIssueListItem,
        createdAt: 'invalid-date',
      };

      const result = IssueListResponseSchema.safeParse(invalidIssue);
      expect(result.success).toBe(false);
    });

    it('should reject invalid date format for updatedAt', () => {
      const invalidIssue = {
        ...baseValidIssueListItem,
        updatedAt: 'invalid-date',
      };

      const result = IssueListResponseSchema.safeParse(invalidIssue);
      expect(result.success).toBe(false);
    });
  });
});
