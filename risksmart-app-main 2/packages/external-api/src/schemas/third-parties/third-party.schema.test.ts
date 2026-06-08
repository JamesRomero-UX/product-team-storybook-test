import { describe, expect, it } from 'vitest';

import {
  ThirdPartyItemResponseSchema,
  ThirdPartyListResponseSchema,
} from './third-party.schema';

describe('ThirdPartyItemResponseSchema', () => {
  const baseValidThirdParty = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    sequentialId: 1,
    title: 'Test Third Party',
    description: 'Test Description',
    createdAt: '2023-01-01T00:00:00.000+00:00',
    updatedAt: '2023-01-01T00:00:00.000+00:00',
    createdBy: 'provider|user123',
    updatedBy: 'provider|user123',
    owners: [],
    contributors: [],
    tags: [],
    companyName: 'Acme Corporation Ltd',
    companyRegistration: '12345678',
    address: {
      addressLine1: '123 Main Street',
      cityTown: 'London',
      postcode: 'SW1A 1AA',
      country: 'United Kingdom',
    },
    primaryContactName: 'John Doe',
    contactName: 'Jane Smith',
    contactEmail: 'contact@acme.com',
    companyDomain: 'acme.com',
    type: 'supplier',
    status: 'active',
    criticality: 3,
    links: {
      self: {
        href: '/api/v1/third-parties/123e4567-e89b-12d3-a456-426614174000',
      },
      createdBy: null,
      updatedBy: null,
      owners: [],
      contributors: [],
    },
  };

  it('should validate a valid third party item object', () => {
    const validThirdPartyItem = {
      ...baseValidThirdParty,
      description: 'This is a test third party',
      createdBy: 'provider|user123',
      updatedBy: 'provider|user456',
      owners: ['provider|owner1'],
      contributors: ['provider|contributor1'],
      tags: [
        {
          name: 'critical',
          description: 'Critical vendor',
        },
      ],
      links: {
        self: {
          href: '/api/v1/third-parties/123e4567-e89b-12d3-a456-426614174000',
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

    const result = ThirdPartyItemResponseSchema.safeParse(validThirdPartyItem);
    expect(result.success).toBe(true);
  });

  it('should reject empty title', () => {
    const invalidThirdParty = {
      ...baseValidThirdParty,
      title: '',
    };

    const result = ThirdPartyItemResponseSchema.safeParse(invalidThirdParty);
    expect(result.success).toBe(false);
  });

  it('should reject invalid UUID', () => {
    const invalidThirdParty = {
      ...baseValidThirdParty,
      id: 'not-a-uuid',
      links: {
        ...baseValidThirdParty.links,
        self: { href: '/api/v1/third-parties/not-a-uuid' },
      },
    };

    const result = ThirdPartyItemResponseSchema.safeParse(invalidThirdParty);
    expect(result.success).toBe(false);
  });

  it('should accept null description', () => {
    const validThirdParty = {
      ...baseValidThirdParty,
      description: null,
    };

    const result = ThirdPartyItemResponseSchema.safeParse(validThirdParty);
    expect(result.success).toBe(true);
  });

  it('should accept null sequentialId', () => {
    const validThirdParty = {
      ...baseValidThirdParty,
      sequentialId: null,
    };

    const result = ThirdPartyItemResponseSchema.safeParse(validThirdParty);
    expect(result.success).toBe(true);
  });

  it('should reject negative sequentialId', () => {
    const invalidThirdParty = {
      ...baseValidThirdParty,
      sequentialId: -1,
    };

    const result = ThirdPartyItemResponseSchema.safeParse(invalidThirdParty);
    expect(result.success).toBe(false);
  });

  it('should reject third party with extra fields due to strict mode', () => {
    const invalidThirdParty = {
      ...baseValidThirdParty,
      extraField: 'should not be here',
    };

    const result = ThirdPartyItemResponseSchema.safeParse(invalidThirdParty);
    expect(result.success).toBe(false);
  });

  it('should accept null createdBy and updatedBy', () => {
    const validThirdParty = {
      ...baseValidThirdParty,
      createdBy: null,
      updatedBy: null,
    };

    const result = ThirdPartyItemResponseSchema.safeParse(validThirdParty);
    expect(result.success).toBe(true);
  });

  it('should accept empty arrays for owners, contributors, and tags', () => {
    const result = ThirdPartyItemResponseSchema.safeParse(baseValidThirdParty);
    expect(result.success).toBe(true);
  });

  it('should accept null companyRegistration', () => {
    const validThirdParty = {
      ...baseValidThirdParty,
      companyRegistration: null,
    };

    const result = ThirdPartyItemResponseSchema.safeParse(validThirdParty);
    expect(result.success).toBe(true);
  });

  it('should accept null address', () => {
    const validThirdParty = {
      ...baseValidThirdParty,
      address: null,
    };

    const result = ThirdPartyItemResponseSchema.safeParse(validThirdParty);
    expect(result.success).toBe(true);
  });

  it('should accept null contact fields', () => {
    const validThirdParty = {
      ...baseValidThirdParty,
      primaryContactName: null,
      contactName: null,
      contactEmail: null,
      companyDomain: null,
    };

    const result = ThirdPartyItemResponseSchema.safeParse(validThirdParty);
    expect(result.success).toBe(true);
  });

  it('should accept address with null fields', () => {
    const validThirdParty = {
      ...baseValidThirdParty,
      address: {
        addressLine1: null,
        cityTown: null,
        postcode: null,
        country: null,
      },
    };

    const result = ThirdPartyItemResponseSchema.safeParse(validThirdParty);
    expect(result.success).toBe(true);
  });

  it('should reject invalid criticality value', () => {
    const invalidThirdParty = {
      ...baseValidThirdParty,
      criticality: 'not-a-number',
    };

    const result = ThirdPartyItemResponseSchema.safeParse(invalidThirdParty);
    expect(result.success).toBe(false);
  });

  it('should accept valid criticality numbers', () => {
    const validThirdParty = {
      ...baseValidThirdParty,
      criticality: 4,
    };

    const result = ThirdPartyItemResponseSchema.safeParse(validThirdParty);
    expect(result.success).toBe(true);
  });
});

describe('ThirdPartyListResponseSchema', () => {
  const baseValidThirdPartyListItem = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    sequentialId: 1,
    title: 'Test Third Party',
    description: 'This is a test third party',
    createdAt: '2023-01-01T00:00:00.000+00:00',
    updatedAt: '2023-01-02T00:00:00.000+00:00',
    createdBy: 'provider|user123',
    updatedBy: 'provider|user456',
    owners: ['provider|owner1'],
    contributors: ['provider|contributor1'],
    tags: [],
    links: {
      self: {
        href: '/api/v1/third-parties/123e4567-e89b-12d3-a456-426614174000',
      },
      parents: [],
      createdBy: null,
      updatedBy: null,
      owners: [],
      contributors: [],
    },
  };

  it('should validate a valid third party list item', () => {
    const validThirdPartyListItem = {
      ...baseValidThirdPartyListItem,
      tags: [
        {
          name: 'critical',
          description: 'Critical vendor',
        },
      ],
      links: {
        self: {
          href: '/api/v1/third-parties/123e4567-e89b-12d3-a456-426614174000',
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

    const result = ThirdPartyListResponseSchema.safeParse(
      validThirdPartyListItem
    );
    expect(result.success).toBe(true);
  });

  it('should accept empty parents array', () => {
    const result = ThirdPartyListResponseSchema.safeParse(
      baseValidThirdPartyListItem
    );
    expect(result.success).toBe(true);
  });

  it('should accept null parent references', () => {
    const validThirdPartyListItem = {
      ...baseValidThirdPartyListItem,
      links: {
        ...baseValidThirdPartyListItem.links,
        parents: [null],
      },
    };

    const result = ThirdPartyListResponseSchema.safeParse(
      validThirdPartyListItem
    );
    expect(result.success).toBe(true);
  });

  it('should reject empty title', () => {
    const invalidThirdParty = {
      ...baseValidThirdPartyListItem,
      title: '',
    };

    const result = ThirdPartyListResponseSchema.safeParse(invalidThirdParty);
    expect(result.success).toBe(false);
  });

  it('should reject invalid UUID', () => {
    const invalidThirdParty = {
      ...baseValidThirdPartyListItem,
      id: 'not-a-uuid',
      links: {
        ...baseValidThirdPartyListItem.links,
        self: { href: '/api/v1/third-parties/not-a-uuid' },
      },
    };

    const result = ThirdPartyListResponseSchema.safeParse(invalidThirdParty);
    expect(result.success).toBe(false);
  });

  it('should reject third party with extra fields due to strict mode', () => {
    const invalidThirdParty = {
      ...baseValidThirdPartyListItem,
      extraField: 'should not be here',
    };

    const result = ThirdPartyListResponseSchema.safeParse(invalidThirdParty);
    expect(result.success).toBe(false);
  });

  it('should accept multiple parents', () => {
    const validThirdPartyListItem = {
      ...baseValidThirdPartyListItem,
      links: {
        ...baseValidThirdPartyListItem.links,
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

    const result = ThirdPartyListResponseSchema.safeParse(
      validThirdPartyListItem
    );
    expect(result.success).toBe(true);
  });
});
