import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { NestedEntityInput } from './base.transformer';
import {
  createNestedEntityTransformers,
  transformNestedEntityBase,
} from './base.transformer';

// Mock the utility functions
vi.mock('../../utils/transforms', () => ({
  firstDefined: vi.fn(),
  idToResourceReference: vi.fn(),
  nodeObjectTypeToResourceType: vi.fn(),
  pathResourceReference: vi.fn(),
}));

describe('base.transformer', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    const { firstDefined, idToResourceReference } =
      await import('../../utils/transforms');

    vi.mocked(firstDefined).mockImplementation((...vals) =>
      vals.find((v) => v !== null && v !== undefined)
    );

    vi.mocked(idToResourceReference).mockImplementation(
      (id, type, hrefPrefix) => ({
        id,
        type,
        href: `${hrefPrefix}/${id}`,
      })
    );
  });

  describe('transformNestedEntityBase', () => {
    const mockData: NestedEntityInput = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      Title: '  Test Title  ',
      Description: '  Test Description  ',
      CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
      ModifiedAtTimestamp: '2023-01-02T00:00:00.000Z',
      CreatedByUser: 'provider|user123',
      ModifiedByUser: 'provider|user456',
    };

    it('should transform nested entity with all fields', () => {
      const result = transformNestedEntityBase(mockData, {
        basePath: '/api/v1',
        linkId: 'parent-id',
        parentResourceName: 'issues',
        childResourceName: 'causes',
      });

      expect(result.baseData).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Title',
        description: 'Test Description',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        createdBy: 'provider|user123',
        updatedBy: 'provider|user456',
      });

      expect(result.links).toEqual({
        self: {
          href: '/api/v1/issues/parent-id/causes/123e4567-e89b-12d3-a456-426614174000',
        },
        createdBy: {
          id: 'provider|user123',
          type: 'user',
          href: '/api/v1/users/provider|user123',
        },
        updatedBy: {
          id: 'provider|user456',
          type: 'user',
          href: '/api/v1/users/provider|user456',
        },
      });
    });

    it('should trim whitespace from title and description', () => {
      const result = transformNestedEntityBase(mockData, {
        basePath: '/api/v1',
        linkId: 'parent-id',
        parentResourceName: 'issues',
        childResourceName: 'causes',
      });

      expect(result.baseData.title).toBe('Test Title');
      expect(result.baseData.description).toBe('Test Description');
    });

    it('should handle null Description', () => {
      const dataWithNullDesc = { ...mockData, Description: null };
      const result = transformNestedEntityBase(dataWithNullDesc, {
        basePath: '/api/v1',
        linkId: 'parent-id',
        parentResourceName: 'issues',
        childResourceName: 'causes',
      });

      expect(result.baseData.description).toBeNull();
    });

    it('should handle empty Description string', () => {
      const dataWithEmptyDesc = { ...mockData, Description: '' };
      const result = transformNestedEntityBase(dataWithEmptyDesc, {
        basePath: '/api/v1',
        linkId: 'parent-id',
        parentResourceName: 'issues',
        childResourceName: 'causes',
      });

      expect(result.baseData.description).toBeNull();
    });

    it('should handle whitespace-only Description', () => {
      const dataWithWhitespaceDesc = { ...mockData, Description: '   ' };
      const result = transformNestedEntityBase(dataWithWhitespaceDesc, {
        basePath: '/api/v1',
        linkId: 'parent-id',
        parentResourceName: 'issues',
        childResourceName: 'causes',
      });

      expect(result.baseData.description).toBeNull();
    });

    it('should handle null ModifiedByUser', () => {
      const dataWithNullModifiedBy = {
        ...mockData,
        ModifiedByUser: undefined,
      };
      const result = transformNestedEntityBase(dataWithNullModifiedBy, {
        basePath: '/api/v1',
        linkId: 'parent-id',
        parentResourceName: 'issues',
        childResourceName: 'causes',
      });

      expect(result.baseData.updatedBy).toBe('provider|user123');
      expect(result.links.updatedBy).toEqual({
        id: 'provider|user123',
        type: 'user',
        href: '/api/v1/users/provider|user123',
      });
    });

    it('should handle null ModifiedAtTimestamp', () => {
      const dataWithNullModifiedAt = {
        ...mockData,
        ModifiedAtTimestamp: undefined,
      };
      const result = transformNestedEntityBase(dataWithNullModifiedAt, {
        basePath: '/api/v1',
        linkId: 'parent-id',
        parentResourceName: 'issues',
        childResourceName: 'causes',
      });

      expect(result.baseData.updatedAt).toBe('2023-01-01T00:00:00.000Z');
    });

    it('should handle null CreatedByUser', () => {
      const dataWithNullCreatedBy = { ...mockData, CreatedByUser: null };
      const result = transformNestedEntityBase(dataWithNullCreatedBy, {
        basePath: '/api/v1',
        linkId: 'parent-id',
        parentResourceName: 'issues',
        childResourceName: 'causes',
      });

      expect(result.links.createdBy).toBeNull();
      // updatedBy should still be set to ModifiedByUser
      expect(result.links.updatedBy).toEqual({
        id: 'provider|user456',
        type: 'user',
        href: '/api/v1/users/provider|user456',
      });
    });

    it('should handle both null CreatedByUser and null ModifiedByUser', () => {
      const dataWithNullUsers = {
        ...mockData,
        CreatedByUser: null,
        ModifiedByUser: undefined,
      };
      const result = transformNestedEntityBase(dataWithNullUsers, {
        basePath: '/api/v1',
        linkId: 'parent-id',
        parentResourceName: 'issues',
        childResourceName: 'causes',
      });

      expect(result.links.createdBy).toBeNull();
      expect(result.links.updatedBy).toBeNull();
    });
  });

  describe('createNestedEntityTransformers', () => {
    interface TestInput extends NestedEntityInput {
      TestField: string;
      ParentTestId: string;
      [key: string]: unknown;
    }

    interface TestItemOutput {
      id: string;
      title: string;
      description: string | null;
      testField: string;
      createdAt: string;
      updatedAt: string;
      createdBy: string | null;
      updatedBy: string | null;
      links: {
        self: { href: string };
        createdBy: unknown;
        updatedBy: unknown;
      };
    }

    interface TestListOutput {
      id: string;
      title: string;
      description: string | null;
      testField: string;
      createdAt: string;
      updatedAt: string;
      createdBy: string | null;
      updatedBy: string | null;
      links: {
        self: { href: string };
        createdBy: unknown;
        updatedBy: unknown;
        parents: unknown[];
      };
    }

    const mockTestSchema = {
      parse: (data: unknown) => data as TestItemOutput,
    };

    const mockListSchema = {
      parse: (data: unknown) => data as TestListOutput,
    };

    const mockData: TestInput = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      Title: 'Test Entity',
      Description: 'Test Description',
      TestField: 'test-value',
      ParentTestId: 'parent-id',
      CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
      ModifiedAtTimestamp: '2023-01-02T00:00:00.000Z',
      CreatedByUser: 'provider|user123',
      ModifiedByUser: 'provider|user456',
    };

    describe('transformItem', () => {
      it('should transform item with extracted fields', () => {
        const { transformItem } = createNestedEntityTransformers<
          TestInput,
          TestItemOutput,
          TestListOutput
        >({
          parentResourceName: 'tests',
          childResourceName: 'items',
          parentIdField: 'ParentTestId',
          parentResourceType: 'test',
          itemSchema: mockTestSchema,
          listSchema: mockListSchema,
          extractItemFields: (data) => ({ testField: data.TestField }),
        });

        const result = transformItem(mockData, {
          basePath: '/api/v1',
          linkId: 'parent-id',
        });

        expect(result.id).toBe('123e4567-e89b-12d3-a456-426614174000');
        expect(result.title).toBe('Test Entity');
        expect(result.testField).toBe('test-value');
        expect(result.links.self.href).toBe(
          '/api/v1/tests/parent-id/items/123e4567-e89b-12d3-a456-426614174000'
        );
      });

      it('should throw error when linkId is missing', () => {
        const { transformItem } = createNestedEntityTransformers<
          TestInput,
          TestItemOutput,
          TestListOutput
        >({
          parentResourceName: 'tests',
          childResourceName: 'items',
          parentIdField: 'ParentTestId',
          parentResourceType: 'test',
          itemSchema: mockTestSchema,
          listSchema: mockListSchema,
        });

        expect(() => transformItem(mockData, { basePath: '/api/v1' })).toThrow(
          'Link ID required for item transforms'
        );
      });

      it('should handle singular childResourceName ending with s', () => {
        const { transformItem } = createNestedEntityTransformers<
          TestInput,
          TestItemOutput,
          TestListOutput
        >({
          parentResourceName: 'tests',
          childResourceName: 'causes',
          parentIdField: 'ParentTestId',
          parentResourceType: 'test',
          itemSchema: mockTestSchema,
          listSchema: mockListSchema,
        });

        expect(() => transformItem(mockData, { basePath: '/api/v1' })).toThrow(
          'Link ID required for cause transforms'
        );
      });
    });

    describe('transformList', () => {
      it('should transform list with parent references', () => {
        const { transformList } = createNestedEntityTransformers<
          TestInput,
          TestItemOutput,
          TestListOutput
        >({
          parentResourceName: 'tests',
          childResourceName: 'items',
          parentIdField: 'ParentTestId',
          parentResourceType: 'test',
          itemSchema: mockTestSchema,
          listSchema: mockListSchema,
          extractListFields: (data) => ({ testField: data.TestField }),
        });

        const result = transformList(
          { data: [mockData] },
          { basePath: '/api/v1', linkId: 'parent-id' }
        );

        expect(result).toHaveLength(1);
        expect(result[0]!.id).toBe('123e4567-e89b-12d3-a456-426614174000');
        expect(result[0]!.title).toBe('Test Entity');
        expect(result[0]!.testField).toBe('test-value');
        expect(result[0]!.links.parents).toHaveLength(1);
        expect(result[0]!.links.parents[0]).toEqual({
          id: 'parent-id',
          type: 'test',
          href: '/api/v1/tests/parent-id',
        });
      });

      it('should handle empty list', () => {
        const { transformList } = createNestedEntityTransformers<
          TestInput,
          TestItemOutput,
          TestListOutput
        >({
          parentResourceName: 'tests',
          childResourceName: 'items',
          parentIdField: 'ParentTestId',
          parentResourceType: 'test',
          itemSchema: mockTestSchema,
          listSchema: mockListSchema,
        });

        const result = transformList(
          { data: [] },
          { basePath: '/api/v1', linkId: 'parent-id' }
        );

        expect(result).toHaveLength(0);
      });

      it('should throw error when linkId is missing', () => {
        const { transformList } = createNestedEntityTransformers<
          TestInput,
          TestItemOutput,
          TestListOutput
        >({
          parentResourceName: 'tests',
          childResourceName: 'items',
          parentIdField: 'ParentTestId',
          parentResourceType: 'test',
          itemSchema: mockTestSchema,
          listSchema: mockListSchema,
        });

        expect(() =>
          transformList({ data: [mockData] }, { basePath: '/api/v1' })
        ).toThrow('Link ID required for item transforms');
      });

      it('should transform multiple items', () => {
        const { transformList } = createNestedEntityTransformers<
          TestInput,
          TestItemOutput,
          TestListOutput
        >({
          parentResourceName: 'tests',
          childResourceName: 'items',
          parentIdField: 'ParentTestId',
          parentResourceType: 'test',
          itemSchema: mockTestSchema,
          listSchema: mockListSchema,
          extractListFields: (data) => ({ testField: data.TestField }),
        });

        const mockData2 = {
          ...mockData,
          Id: '223e4567-e89b-12d3-a456-426614174001',
          Title: 'Test Entity 2',
        };

        const result = transformList(
          { data: [mockData, mockData2] },
          { basePath: '/api/v1', linkId: 'parent-id' }
        );

        expect(result).toHaveLength(2);
        expect(result[0]!.id).toBe('123e4567-e89b-12d3-a456-426614174000');
        expect(result[1]!.id).toBe('223e4567-e89b-12d3-a456-426614174001');
      });
    });
  });
});
