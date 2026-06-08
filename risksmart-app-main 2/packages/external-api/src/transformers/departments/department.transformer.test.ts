import { describe, expect, it } from 'vitest';

import type { DepartmentTypeListQueryResponse } from '../../clients/client.interface';
import {
  transformItem,
  transformListQueryResponse,
} from './department.transformer';

const mockMetadata = {
  nextId: null,
  nextDateTime: null,
  prevId: null,
  prevDateTime: null,
  hasNext: false,
  hasPrev: false,
  count: 1,
};

const baseListItem = {
  DepartmentTypeId: '123e4567-e89b-12d3-a456-426614174000',
  Name: 'Finance',
  Description: 'Finance department',
  CreatedAtTimestamp: '2024-01-01T00:00:00.000Z',
  ModifiedAtTimestamp: '2024-01-02T00:00:00.000Z',
  CreatedByUser: 'auth0|creator123',
  ModifiedByUser: 'auth0|modifier456',
  DepartmentTypeGroupId: '123e4567-e89b-12d3-a456-426614174000',
  OrgKey: 'org-key',
} as unknown as DepartmentTypeListQueryResponse['departmentType'][0];

describe('department.transformer', () => {
  describe('transformListQueryResponse', () => {
    it('should map all fields correctly', () => {
      const result = transformListQueryResponse(
        { data: [baseListItem], metadata: mockMetadata },
        { basePath: '/api/v1' }
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Finance',
        description: 'Finance department',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
        createdBy: 'auth0|creator123',
        updatedBy: 'auth0|modifier456',
        links: {
          self: {
            href: '/api/v1/departments/123e4567-e89b-12d3-a456-426614174000',
          },
          createdBy: {
            id: 'auth0|creator123',
            type: 'user',
            href: '/api/v1/users/auth0%7Ccreator123',
          },
          updatedBy: {
            id: 'auth0|modifier456',
            type: 'user',
            href: '/api/v1/users/auth0%7Cmodifier456',
          },
        },
      });
    });

    it('should return an empty array for empty input', () => {
      const result = transformListQueryResponse(
        { data: [], metadata: { ...mockMetadata, count: 0 } },
        { basePath: '/api/v1' }
      );

      expect(result).toEqual([]);
    });

    it('should handle nullable description', () => {
      const item = {
        ...baseListItem,
        Description: null as string | null,
      };
      const result = transformListQueryResponse(
        { data: [item], metadata: mockMetadata },
        { basePath: '/api/v1' }
      );

      expect(result[0]?.description).toBeNull();
    });

    it('should handle null createdBy user', () => {
      const item = {
        ...baseListItem,
        CreatedByUser: null as string | null,
      };
      const result = transformListQueryResponse(
        { data: [item], metadata: mockMetadata },
        { basePath: '/api/v1' }
      );

      expect(result[0]?.createdBy).toBeNull();
      expect(result[0]?.links.createdBy).toBeNull();
    });

    it('should fall back to createdBy link when updatedBy user is null', () => {
      const item = {
        ...baseListItem,
        ModifiedByUser: null,
      } as never;
      const result = transformListQueryResponse(
        { data: [item], metadata: mockMetadata },
        { basePath: '/api/v1' }
      );

      expect(result[0]?.links.updatedBy).toEqual({
        id: 'auth0|creator123',
        type: 'user',
        href: '/api/v1/users/auth0%7Ccreator123',
      });
    });

    it('should use ModifiedAtTimestamp fallback to CreatedAtTimestamp for updatedAt', () => {
      const item = {
        ...baseListItem,
        ModifiedAtTimestamp: null,
      } as never;
      const result = transformListQueryResponse(
        { data: [item], metadata: mockMetadata },
        { basePath: '/api/v1' }
      );

      expect(result[0]?.updatedAt).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should transform multiple items', () => {
      const secondItem = {
        ...baseListItem,
        DepartmentTypeId: '223e4567-e89b-12d3-a456-426614174001',
        Name: 'Engineering',
      };
      const result = transformListQueryResponse(
        {
          data: [baseListItem, secondItem],
          metadata: { ...mockMetadata, count: 2 },
        },
        { basePath: '/api/v1' }
      );

      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(result[1]?.id).toBe('223e4567-e89b-12d3-a456-426614174001');
    });
  });

  describe('transformItem', () => {
    it('should map all fields correctly', () => {
      const result = transformItem(baseListItem as never, {
        basePath: '/api/v1',
      });

      expect(result).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Finance',
        description: 'Finance department',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
        createdBy: 'auth0|creator123',
        updatedBy: 'auth0|modifier456',
        departmentGroupId: baseListItem.DepartmentTypeGroupId,
        links: {
          self: {
            href: '/api/v1/departments/123e4567-e89b-12d3-a456-426614174000',
          },
          createdBy: {
            id: 'auth0|creator123',
            type: 'user',
            href: '/api/v1/users/auth0%7Ccreator123',
          },
          updatedBy: {
            id: 'auth0|modifier456',
            type: 'user',
            href: '/api/v1/users/auth0%7Cmodifier456',
          },
          departmentGroup: {
            id: baseListItem.DepartmentTypeGroupId,
            type: 'department-group',
            href: `/api/v1/department-groups/${baseListItem.DepartmentTypeGroupId}`,
          },
        },
      });
    });

    it('should handle nullable description', () => {
      const item = { ...baseListItem, Description: null as string | null };
      const result = transformItem(item as never, { basePath: '/api/v1' });

      expect(result.description).toBeNull();
    });

    it('should handle null createdBy user', () => {
      const item = { ...baseListItem, CreatedByUser: null as string | null };
      const result = transformItem(item as never, { basePath: '/api/v1' });

      expect(result.createdBy).toBeNull();
      expect(result.links.createdBy).toBeNull();
    });

    it('should fall back to createdBy link when updatedBy user is null', () => {
      const item = { ...baseListItem, ModifiedByUser: null } as never;
      const result = transformItem(item, { basePath: '/api/v1' });

      expect(result.links.updatedBy).toEqual({
        id: 'auth0|creator123',
        type: 'user',
        href: '/api/v1/users/auth0%7Ccreator123',
      });
    });

    it('should use CreatedAtTimestamp fallback for updatedAt when ModifiedAtTimestamp is null', () => {
      const item = {
        ...baseListItem,
        ModifiedAtTimestamp: null,
      } as never;
      const result = transformItem(item, { basePath: '/api/v1' });

      expect(result.updatedAt).toBe('2024-01-01T00:00:00.000Z');
    });
  });
});
