import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { UserByIdResponse } from '../../clients/client.interface';
import { transformItem, transformListQueryResponse } from './user.transformer';

// Mock the utility functions to isolate transformer logic
vi.mock('../../utils/transforms', () => ({
  firstDefined: vi.fn(),
}));

describe('user.transformer', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Set up default mock implementations
    const { firstDefined } = await import('../../utils/transforms');

    vi.mocked(firstDefined).mockImplementation((...vals) =>
      vals.find((v) => v !== null && v !== undefined)
    );
  });

  describe('transformItem', () => {
    const baseMockUser = {
      Id: 'auth0|123456789',
      FirstName: 'John',
      LastName: 'Doe',
      Email: 'john.doe@example.com',
      UserName: 'johndoe',
      BusinessUnit_Id: '123e4567-e89b-12d3-a456-426614174000',
      Status: 'active',
      JobTitle: 'Senior Risk Manager',
      Department: 'Risk Management',
      OfficeLocation: 'London HQ',
      LastSeen: '2023-12-01T00:00:00.000Z',
      FriendlyName: 'John Doe',
      DisplayName: 'John Doe (Display)',
      RoleKey: 'risk_manager',
      CreatedOn: '2023-01-01T00:00:00.000Z',
      ModifiedAtTimestamp: '2023-01-02T00:00:00.000Z',
      CreatedByUser: null,
      ModifiedByUser: null,
      AuthClient_Id: 'client123',
      AuthClientName: 'RiskSmart',
      AuthTenant: 'tenant123',
      AuthConnection_Id: 'conn123',
      AuthConnection: 'Username-Password-Authentication',
      Meta: null,
      AuthUser_Id: 'auth0|123456789',
      External_Id: null,
    };

    it('should transform a valid user item response', () => {
      const result = transformItem(baseMockUser as unknown as NonNullable<UserByIdResponse>['user'], {
        basePath: '/api/v1',
      });

      expect(result).toEqual({
        id: 'auth0|123456789',
        firstName: 'John',
        lastName: 'Doe',
        businessUnitId: '123e4567-e89b-12d3-a456-426614174000',
        status: 'active',
        jobTitle: 'Senior Risk Manager',
        department: 'Risk Management',
        officeLocation: 'London HQ',
        lastSeen: '2023-12-01T00:00:00.000Z',
        friendlyName: 'John Doe',
        links: { self: { href: '/api/v1/users/auth0%7C123456789' } },
      });
    });

    it('should use FriendlyName when available', () => {
      const mockUser = {
        ...baseMockUser,
        FriendlyName: 'Johnny D',
        FirstName: 'John',
        LastName: 'Doe',
      };

      const result = transformItem(mockUser as unknown as NonNullable<UserByIdResponse>['user'], {
        basePath: '/api/v1',
      });

      expect(result.friendlyName).toBe('Johnny D');
    });

    it('should construct friendlyName from FirstName and LastName when FriendlyName is null', () => {
      const mockUser = {
        ...baseMockUser,
        FriendlyName: null,
        FirstName: 'Jane',
        LastName: 'Smith',
      };

      const result = transformItem(mockUser as unknown as NonNullable<UserByIdResponse>['user'], {
        basePath: '/api/v1',
      });

      expect(result.friendlyName).toBe('Jane Smith');
    });

    it('should use "Unknown User" when no name fields are available', () => {
      const mockUser = {
        ...baseMockUser,
        FriendlyName: null,
        FirstName: null,
        LastName: null,
      };

      const result = transformItem(mockUser as unknown as NonNullable<UserByIdResponse>['user'], {
        basePath: '/api/v1',
      });

      expect(result.friendlyName).toBe('Unknown User');
    });

    it('should use "Unknown User" when only FirstName is available', () => {
      const mockUser = {
        ...baseMockUser,
        FriendlyName: null,
        FirstName: 'John',
        LastName: null,
      };

      const result = transformItem(mockUser as unknown as NonNullable<UserByIdResponse>['user'], {
        basePath: '/api/v1',
      });

      expect(result.friendlyName).toBe('Unknown User');
    });

    it('should use "Unknown User" when only LastName is available', () => {
      const mockUser = {
        ...baseMockUser,
        FriendlyName: null,
        FirstName: null,
        LastName: 'Doe',
      };

      const result = transformItem(mockUser as unknown as NonNullable<UserByIdResponse>['user'], {
        basePath: '/api/v1',
      });

      expect(result.friendlyName).toBe('Unknown User');
    });

    it('should handle null FirstName', () => {
      const mockUser = {
        ...baseMockUser,
        FirstName: null,
      };

      const result = transformItem(mockUser as unknown as NonNullable<UserByIdResponse>['user'], {
        basePath: '/api/v1',
      });

      expect(result.firstName).toBeNull();
    });

    it('should handle null LastName', () => {
      const mockUser = {
        ...baseMockUser,
        LastName: null,
      };

      const result = transformItem(mockUser as unknown as NonNullable<UserByIdResponse>['user'], {
        basePath: '/api/v1',
      });

      expect(result.lastName).toBeNull();
    });

    it('should handle null BusinessUnit_Id', () => {
      const mockUser = {
        ...baseMockUser,
        BusinessUnit_Id: null,
      };

      const result = transformItem(mockUser as unknown as NonNullable<UserByIdResponse>['user'], {
        basePath: '/api/v1',
      });

      expect(result.businessUnitId).toBeNull();
    });

    it('should handle null Status', () => {
      const mockUser = {
        ...baseMockUser,
        Status: null,
      };

      const result = transformItem(mockUser as unknown as NonNullable<UserByIdResponse>['user'], {
        basePath: '/api/v1',
      });

      expect(result.status).toBeNull();
    });

    it('should handle null JobTitle', () => {
      const mockUser = {
        ...baseMockUser,
        JobTitle: null,
      };

      const result = transformItem(mockUser as unknown as NonNullable<UserByIdResponse>['user'], {
        basePath: '/api/v1',
      });

      expect(result.jobTitle).toBeNull();
    });

    it('should handle null Department', () => {
      const mockUser = {
        ...baseMockUser,
        Department: null,
      };

      const result = transformItem(mockUser as unknown as NonNullable<UserByIdResponse>['user'], {
        basePath: '/api/v1',
      });

      expect(result.department).toBeNull();
    });

    it('should handle null OfficeLocation', () => {
      const mockUser = {
        ...baseMockUser,
        OfficeLocation: null,
      };

      const result = transformItem(mockUser as unknown as NonNullable<UserByIdResponse>['user'], {
        basePath: '/api/v1',
      });

      expect(result.officeLocation).toBeNull();
    });

    it('should handle null LastSeen', () => {
      const mockUser = {
        ...baseMockUser,
        LastSeen: null,
      };

      const result = transformItem(mockUser as unknown as NonNullable<UserByIdResponse>['user'], {
        basePath: '/api/v1',
      });

      expect(result.lastSeen).toBeNull();
    });

    it('should handle all nullable fields as null', () => {
      const mockUser = {
        ...baseMockUser,
        FirstName: null,
        LastName: null,
        BusinessUnit_Id: null,
        Status: null,
        JobTitle: null,
        Department: null,
        OfficeLocation: null,
        LastSeen: null,
        FriendlyName: 'System User',
      };

      const result = transformItem(mockUser as unknown as NonNullable<UserByIdResponse>['user'], {
        basePath: '/api/v1',
      });

      expect(result).toEqual({
        id: 'auth0|123456789',
        firstName: null,
        lastName: null,
        businessUnitId: null,
        status: null,
        jobTitle: null,
        department: null,
        officeLocation: null,
        lastSeen: null,
        friendlyName: 'System User',
        links: { self: { href: '/api/v1/users/auth0%7C123456789' } },
      });
    });

    it('should handle different user ID formats', () => {
      const mockUser = {
        ...baseMockUser,
        Id: 'google-oauth2|987654321',
      };

      const result = transformItem(mockUser as unknown as NonNullable<UserByIdResponse>['user'], {
        basePath: '/api/v1',
      });

      expect(result.id).toBe('google-oauth2|987654321');
    });

    it('should preserve exact friendlyName from database', () => {
      const mockUser = {
        ...baseMockUser,
        FriendlyName: 'Dr. John Doe, PhD',
      };

      const result = transformItem(mockUser as unknown as NonNullable<UserByIdResponse>['user'], {
        basePath: '/api/v1',
      });

      expect(result.friendlyName).toBe('Dr. John Doe, PhD');
    });
  });

  describe('transformListQueryResponse', () => {
    const baseMockListUser = {
      Id: 'auth0|123456789',
      FirstName: 'John',
      LastName: 'Doe',
      Email: 'john.doe@example.com',
      UserName: 'johndoe',
      BusinessUnit_Id: '123e4567-e89b-12d3-a456-426614174000',
      Status: 'active',
      JobTitle: 'Senior Risk Manager',
      Department: 'Risk Management',
      OfficeLocation: 'London HQ',
      LastSeen: '2023-12-01T00:00:00.000Z',
      FriendlyName: 'John Doe',
      DisplayName: 'John Doe (Display)',
      RoleKey: 'risk_manager',
      CreatedOn: '2023-01-01T00:00:00.000Z',
      ModifiedAtTimestamp: '2023-01-02T00:00:00.000Z',
      CreatedByUser: null,
      ModifiedByUser: null,
      AuthClient_Id: 'client123',
      AuthClientName: 'RiskSmart',
      AuthTenant: 'tenant123',
      AuthConnection_Id: 'conn123',
      AuthConnection: 'Username-Password-Authentication',
      Meta: null,
      AuthUser_Id: 'auth0|123456789',
      External_Id: null,
    };

    it('should map all fields correctly for a single item', () => {
      const result = transformListQueryResponse(
        { data: [baseMockListUser] } as unknown as Parameters<typeof transformListQueryResponse>[0],
        { basePath: '/api/v1' }
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'auth0|123456789',
        firstName: 'John',
        lastName: 'Doe',
        lastSeen: '2023-12-01T00:00:00.000Z',
        friendlyName: 'John Doe',
        links: {
          self: { href: '/api/v1/users/auth0%7C123456789' },
        },
      });
    });

    it('should return empty array for empty input', () => {
      const result = transformListQueryResponse(
        { data: [] } as unknown as Parameters<typeof transformListQueryResponse>[0],
        { basePath: '/api/v1' }
      );

      expect(result).toEqual([]);
    });

    it('should fall back to FirstName + LastName when FriendlyName is null', () => {
      const mockUser = { ...baseMockListUser, FriendlyName: null, FirstName: 'Jane', LastName: 'Smith' };

      const result = transformListQueryResponse(
        { data: [mockUser] } as unknown as Parameters<typeof transformListQueryResponse>[0],
        { basePath: '/api/v1' }
      );

      expect(result[0]!.friendlyName).toBe('Jane Smith');
    });

    it('should use "Unknown User" when FriendlyName, FirstName, and LastName are all null', () => {
      const mockUser = { ...baseMockListUser, FriendlyName: null, FirstName: null, LastName: null };

      const result = transformListQueryResponse(
        { data: [mockUser] } as unknown as Parameters<typeof transformListQueryResponse>[0],
        { basePath: '/api/v1' }
      );

      expect(result[0]!.friendlyName).toBe('Unknown User');
    });

    it('should handle null nullable fields', () => {
      const mockUser = {
        ...baseMockListUser,
        FirstName: null,
        LastName: null,
        LastSeen: null,
        FriendlyName: 'System User',
      };

      const result = transformListQueryResponse(
        { data: [mockUser] } as unknown as Parameters<typeof transformListQueryResponse>[0],
        { basePath: '/api/v1' }
      );

      expect(result[0]).toEqual({
        id: 'auth0|123456789',
        firstName: null,
        lastName: null,
        lastSeen: null,
        friendlyName: 'System User',
        links: {
          self: { href: '/api/v1/users/auth0%7C123456789' },
        },
      });
    });

    it('should transform multiple items', () => {
      const secondUser = {
        ...baseMockListUser,
        Id: '550e8400-e29b-41d4-a716-446655440000',
        FirstName: 'Jane',
        LastName: 'Smith',
        FriendlyName: 'Jane Smith',
      };

      const result = transformListQueryResponse(
        { data: [baseMockListUser, secondUser] } as unknown as Parameters<typeof transformListQueryResponse>[0],
        { basePath: '/api/v1' }
      );

      expect(result).toHaveLength(2);
      expect(result[1]!.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(result[1]!.friendlyName).toBe('Jane Smith');
    });

    it('should URL-encode provider-format IDs in links.self.href', () => {
      const mockUser = { ...baseMockListUser, Id: 'auth0|123' };

      const result = transformListQueryResponse(
        { data: [mockUser] } as unknown as Parameters<typeof transformListQueryResponse>[0],
        { basePath: '/api/v1' }
      );

      expect(result[0]!.links.self!.href).toBe('/api/v1/users/auth0%7C123');
    });
  });
});
