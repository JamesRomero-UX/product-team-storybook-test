import { describe, expect, it } from 'vitest';

import {
  transformItem,
  transformListQueryResponse,
} from './third-party.transformer';

describe('third-party.transformer', () => {
  describe('transformItem', () => {
    const baseThirdParty = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      SequentialId: 42,
      Title: 'Acme Corporation',
      Description: 'Leading supplier of widgets',
      CreatedAtTimestamp: '2023-01-01T00:00:00Z',
      ModifiedAtTimestamp: '2023-01-02T00:00:00Z',
      CreatedByUser: 'auth0|user123',
      ModifiedByUser: 'auth0|user456',
      owners: [{ UserId: 'auth0|owner1' }],
      contributors: [{ UserId: 'auth0|contributor1' }],
      tags: [
        {
          type: {
            Name: 'category',
            Description: 'critical',
          },
        },
      ],
      CompanyName: 'Acme Corporation Ltd',
      CompaniesHouseNumber: '12345678',
      Address: '123 Main Street',
      CityTown: 'London',
      Postcode: 'SW1A 1AA',
      Country: 'United Kingdom',
      PrimaryContactName: 'John Doe',
      ContactName: 'Jane Smith',
      ContactEmail: 'contact@acme.com',
      CompanyDomain: 'acme.com',
      Type: 'supplier',
      Status: 'active',
      Criticality: 3,
    };

    it('should transform a valid third party item response', () => {
      const result = transformItem(baseThirdParty as never, {
        basePath: 'api/v1',
      });

      expect(result).toMatchObject({
        id: '123e4567-e89b-12d3-a456-426614174000',
        sequentialId: 42,
        title: 'Acme Corporation',
        description: 'Leading supplier of widgets',
        createdBy: 'auth0|user123',
        updatedBy: 'auth0|user456',
        owners: ['auth0|owner1'],
        contributors: ['auth0|contributor1'],
        tags: [
          {
            name: 'category',
            description: 'critical',
          },
        ],
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
      });

      // Check transformed dates
      expect(result.createdAt).toBe('2023-01-01T00:00:00Z');
      expect(result.updatedAt).toBe('2023-01-02T00:00:00Z');

      // Check self link
      expect(result.links.self.href).toBe(
        'api/v1/third-parties/123e4567-e89b-12d3-a456-426614174000'
      );

      // Check user links
      expect(result.links.createdBy).toMatchObject({
        id: 'auth0|user123',
        type: 'user',
      });
      expect(result.links.updatedBy).toMatchObject({
        id: 'auth0|user456',
        type: 'user',
      });
      expect(result.links.owners[0]).toMatchObject({
        id: 'auth0|owner1',
        type: 'user',
      });
      expect(result.links.contributors[0]).toMatchObject({
        id: 'auth0|contributor1',
        type: 'user',
      });
    });

    it('should handle null Description', () => {
      const thirdParty = {
        ...baseThirdParty,
        Description: null,
      };

      const result = transformItem(thirdParty as never, { basePath: 'api/v1' });

      expect(result.description).toBeNull();
    });

    it('should handle null CompaniesHouseNumber', () => {
      const thirdParty = {
        ...baseThirdParty,
        CompaniesHouseNumber: null,
      };

      const result = transformItem(thirdParty as never, { basePath: 'api/v1' });

      expect(result.companyRegistration).toBeNull();
    });

    it('should handle null address when all fields are null', () => {
      const thirdParty = {
        ...baseThirdParty,
        Address: null,
        CityTown: null,
        Postcode: null,
        Country: null,
      };

      const result = transformItem(thirdParty as never, { basePath: 'api/v1' });

      expect(result.address).toBeNull();
    });

    it('should create address object when at least one field has a value', () => {
      const thirdParty = {
        ...baseThirdParty,
        Address: null,
        CityTown: 'London',
        Postcode: null,
        Country: null,
      };

      const result = transformItem(thirdParty as never, { basePath: 'api/v1' });

      expect(result.address).toEqual({
        addressLine1: null,
        cityTown: 'London',
        postcode: null,
        country: null,
      });
    });

    it('should handle null PrimaryContactName', () => {
      const thirdParty = {
        ...baseThirdParty,
        PrimaryContactName: null,
      };

      const result = transformItem(thirdParty as never, { basePath: 'api/v1' });

      expect(result.primaryContactName).toBeNull();
    });

    it('should handle null ContactName', () => {
      const thirdParty = {
        ...baseThirdParty,
        ContactName: null,
      };

      const result = transformItem(thirdParty as never, { basePath: 'api/v1' });

      expect(result.contactName).toBeNull();
    });

    it('should handle null ContactEmail', () => {
      const thirdParty = {
        ...baseThirdParty,
        ContactEmail: null,
      };

      const result = transformItem(thirdParty as never, { basePath: 'api/v1' });

      expect(result.contactEmail).toBeNull();
    });

    it('should handle empty string ContactEmail', () => {
      const thirdParty = {
        ...baseThirdParty,
        ContactEmail: '',
      };

      const result = transformItem(thirdParty as never, { basePath: 'api/v1' });

      expect(result.contactEmail).toEqual('');
    });

    it('should handle null CompanyDomain', () => {
      const thirdParty = {
        ...baseThirdParty,
        CompanyDomain: null,
      };

      const result = transformItem(thirdParty as never, { basePath: 'api/v1' });

      expect(result.companyDomain).toBeNull();
    });

    it('should filter out tags with null type', () => {
      const thirdParty = {
        ...baseThirdParty,
        tags: [
          {
            type: {
              Name: 'category',
              Description: 'critical',
            },
          },
          {
            type: null,
          },
        ],
      };

      const result = transformItem(thirdParty as never, { basePath: 'api/v1' });

      expect(result.tags).toHaveLength(1);
      expect(result.tags[0]).toEqual({
        name: 'category',
        description: 'critical',
      });
    });

    it('should handle null CreatedByUser', () => {
      const thirdParty = {
        ...baseThirdParty,
        CreatedByUser: null,
      };

      const result = transformItem(thirdParty as never, { basePath: 'api/v1' });

      expect(result.createdBy).toBeNull();
      expect(result.links.createdBy).toBeNull();
    });

    it('should handle null SequentialId', () => {
      const thirdParty = {
        ...baseThirdParty,
        SequentialId: null,
      };

      const result = transformItem(thirdParty as never, { basePath: 'api/v1' });

      expect(result.sequentialId).toBeNull();
    });

    it('should handle empty owners and contributors arrays', () => {
      const thirdParty = {
        ...baseThirdParty,
        owners: [],
        contributors: [],
      };

      const result = transformItem(thirdParty as never, { basePath: 'api/v1' });

      expect(result.owners).toEqual([]);
      expect(result.contributors).toEqual([]);
      expect(result.links.owners).toEqual([]);
      expect(result.links.contributors).toEqual([]);
    });
  });

  describe('transformListQueryResponse', () => {
    const baseThirdPartyListItem = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      SequentialId: 42,
      Title: 'Acme Corporation',
      Description: 'Leading supplier of widgets',
      CreatedAtTimestamp: '2023-01-01T00:00:00Z',
      ModifiedAtTimestamp: '2023-01-02T00:00:00Z',
      CreatedByUser: 'auth0|user123',
      ModifiedByUser: 'auth0|user456',
      owners: [{ UserId: 'auth0|owner1' }],
      contributors: [{ UserId: 'auth0|contributor1' }],
      tags: [
        {
          type: {
            Name: 'category',
            Description: 'critical',
          },
        },
      ],
    };

    it('should transform a valid third party list query response', () => {
      const result = transformListQueryResponse(
        {
          data: [baseThirdPartyListItem as never],
          metadata: {
            nextId: null,
            hasNext: false,
            hasPrev: false,
            prevId: null,
            count: 1,
          },
        },
        {
          basePath: 'api/v1',
        }
      );

      expect(result).toHaveLength(1);
      expect(result[0]!).toMatchObject({
        id: '123e4567-e89b-12d3-a456-426614174000',
        sequentialId: 42,
        title: 'Acme Corporation',
        description: 'Leading supplier of widgets',
        createdBy: 'auth0|user123',
        updatedBy: 'auth0|user456',
        owners: ['auth0|owner1'],
        contributors: ['auth0|contributor1'],
        tags: [
          {
            name: 'category',
            description: 'critical',
          },
        ],
      });

      // Check transformed dates
      expect(result[0]!.createdAt).toBe('2023-01-01T00:00:00Z');
      expect(result[0]!.updatedAt).toBe('2023-01-02T00:00:00Z');

      // Check parents array
      expect(result[0]!.links.parents).toEqual([]);

      // Check user links
      expect(result[0]!.links.createdBy).toMatchObject({
        id: 'auth0|user123',
        type: 'user',
      });
      expect(result[0]!.links.updatedBy).toMatchObject({
        id: 'auth0|user456',
        type: 'user',
      });
    });

    it('should always return empty parents array for third parties', () => {
      const result = transformListQueryResponse(
        {
          data: [baseThirdPartyListItem as never],
          metadata: {
            nextId: null,
            hasNext: false,
            hasPrev: false,
            prevId: null,
            count: 1,
          },
        },
        {
          basePath: 'api/v1',
        }
      );

      expect(result[0]!.links.parents).toEqual([]);
    });

    it('should transform multiple third parties', () => {
      const secondThirdParty = {
        ...baseThirdPartyListItem,
        Id: '223e4567-e89b-12d3-a456-426614174001',
        Title: 'Beta Industries',
        SequentialId: 43,
      };

      const result = transformListQueryResponse(
        {
          data: [baseThirdPartyListItem, secondThirdParty] as never[],
          metadata: {
            nextId: null,
            hasNext: false,
            hasPrev: false,
            prevId: null,
            count: 2,
          },
        },
        {
          basePath: 'api/v1',
        }
      );

      expect(result).toHaveLength(2);
      expect(result[0]!.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(result[0]!.title).toBe('Acme Corporation');
      expect(result[1]!.id).toBe('223e4567-e89b-12d3-a456-426614174001');
      expect(result[1]!.title).toBe('Beta Industries');
    });

    it('should handle empty tags array', () => {
      const thirdParty = {
        ...baseThirdPartyListItem,
        tags: [],
      };

      const result = transformListQueryResponse(
        {
          data: [thirdParty as never],
          metadata: {
            nextId: null,
            hasNext: false,
            hasPrev: false,
            prevId: null,
            count: 1,
          },
        },
        {
          basePath: 'api/v1',
        }
      );

      expect(result[0]!.tags).toEqual([]);
    });
  });
});
