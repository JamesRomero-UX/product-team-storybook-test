import { describe, expect, it } from 'vitest';

import type { UserGroupListQueryResponse } from '../../clients/client.interface';
import {
  transformItem,
  transformListQueryResponse,
} from './user-group.transformer';

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
  Id: '123e4567-e89b-12d3-a456-426614174000',
  Name: 'Test User Group',
  Description: 'Test description',
  Email: 'group@example.com',
  OwnerContributor: false,
  CreatedAtTimestamp: '2024-01-01T00:00:00.000Z',
  ModifiedAtTimestamp: '2024-01-02T00:00:00.000Z',
  OrgKey: 'org-key',
} as unknown as UserGroupListQueryResponse['userGroup'][0];

describe('user-group.transformer', () => {
  describe('transformListQueryResponse', () => {
    it('should map all fields correctly', () => {
      const result = transformListQueryResponse(
        { data: [baseListItem], metadata: mockMetadata },
        { basePath: '/api/v1' }
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test User Group',
        description: 'Test description',
        ownerContributor: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
      });
    });

    it('should strip Email field from output', () => {
      const result = transformListQueryResponse(
        { data: [baseListItem], metadata: mockMetadata },
        { basePath: '/api/v1' }
      );

      expect(result[0]).not.toHaveProperty('email');
      expect(result[0]).not.toHaveProperty('Email');
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

    it('should handle ownerContributor as true', () => {
      const item = {
        ...baseListItem,
        OwnerContributor: true,
      };
      const result = transformListQueryResponse(
        { data: [item], metadata: mockMetadata },
        { basePath: '/api/v1' }
      );

      expect(result[0]?.ownerContributor).toBe(true);
    });

    it('should transform multiple items', () => {
      const secondItem = {
        ...baseListItem,
        Id: '223e4567-e89b-12d3-a456-426614174001',
        Name: 'Second Group',
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
    const baseItemData = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      Name: 'Test User Group',
      Description: 'Test description',
      Email: 'group@example.com',
      OwnerContributor: false,
      CreatedAtTimestamp: '2024-01-01T00:00:00.000Z',
      ModifiedAtTimestamp: '2024-01-02T00:00:00.000Z',
      approvers: [
        { Id: '4fa85f64-5717-4562-b3fc-2c963f66afa7' },
        { Id: '5fa85f64-5717-4562-b3fc-2c963f66afa8' },
      ],
    };
    type BaseItemData = typeof baseItemData;

    it('should map all fields correctly', () => {
      const result = transformItem(baseItemData as never);

      expect(result).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test User Group',
        description: 'Test description',
        ownerContributor: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
        approvers: [
          { id: '4fa85f64-5717-4562-b3fc-2c963f66afa7' },
          { id: '5fa85f64-5717-4562-b3fc-2c963f66afa8' },
        ],
      });
    });

    it('should strip Email field from output', () => {
      const result = transformItem(baseItemData as never);

      expect(result).not.toHaveProperty('email');
      expect(result).not.toHaveProperty('Email');
    });

    it('should map approvers array correctly', () => {
      const result = transformItem(baseItemData as never);

      expect(result.approvers).toHaveLength(2);
      expect(result.approvers[0]).toEqual({
        id: '4fa85f64-5717-4562-b3fc-2c963f66afa7',
      });
      expect(result.approvers[1]).toEqual({
        id: '5fa85f64-5717-4562-b3fc-2c963f66afa8',
      });
    });

    it('should handle empty approvers array', () => {
      const item: BaseItemData = { ...baseItemData, approvers: [] };
      const result = transformItem(item as never);

      expect(result.approvers).toEqual([]);
    });

    it('should handle nullable description', () => {
      const item = { ...baseItemData, Description: null as string | null };
      const result = transformItem(item as never);

      expect(result.description).toBeNull();
    });

    it('should handle ownerContributor as true', () => {
      const item: BaseItemData = { ...baseItemData, OwnerContributor: true };
      const result = transformItem(item as never);

      expect(result.ownerContributor).toBe(true);
    });
  });
});
