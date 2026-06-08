import { describe, expect, it } from 'vitest';

import { CURRENT_API_VERSION } from '../versions/index';
import { appVersion, versionResponse, versionResponseList } from './versions';

describe('versions utils', () => {
  describe('appVersion', () => {
    it('should return version with v prefix', () => {
      expect(appVersion).toMatch(/^v\d+\.\d+\.\d+/);
    });

    it('should have correct format', () => {
      expect(appVersion).toContain('v');
    });
  });

  describe('versionResponse', () => {
    const ctx = {
      basePath: '/api/v1',
      requestId: 'test-request-123',
    };

    it('should return data unchanged for unsupported resource (risk)', () => {
      const data = {
        id: '123',
        name: 'Test Risk',
        severity: 'high',
      };

      const result = versionResponse('risk', data, CURRENT_API_VERSION, ctx);

      expect(result).toEqual(data);
    });

    it('should return data unchanged for unsupported resource (action)', () => {
      const data = {
        id: '456',
        title: 'Test Action',
        status: 'open',
      };

      const result = versionResponse('action', data, '2025-10-10', ctx);

      expect(result).toEqual(data);
    });

    it('should return data unchanged for unknown resource', () => {
      const data = {
        id: '789',
        customField: 'customValue',
      };

      const result = versionResponse(
        'unknown-type',
        data,
        CURRENT_API_VERSION,
        ctx
      );

      expect(result).toEqual(data);
    });

    it('should handle empty object for unsupported resource', () => {
      const data = {};

      const result = versionResponse(
        'unsupported',
        data,
        CURRENT_API_VERSION,
        ctx
      );

      expect(result).toEqual(data);
    });

    it('should handle null values for unsupported resource', () => {
      const data = {
        id: '123',
        name: null,
        description: null,
      };

      const result = versionResponse('risk', data, '2025-10-10', ctx);

      expect(result).toEqual(data);
    });

    it('should handle arrays in data for unsupported resource', () => {
      const data = {
        id: '123',
        tags: ['tag1', 'tag2'],
        items: [1, 2, 3],
      };

      const result = versionResponse('risk', data, CURRENT_API_VERSION, ctx);

      expect(result).toEqual(data);
    });

    it('should handle nested objects for unsupported resource', () => {
      const data = {
        id: '123',
        metadata: {
          created: '2025-01-01',
          author: {
            name: 'Test User',
            email: 'test@example.com',
          },
        },
      };

      const result = versionResponse('risk', data, CURRENT_API_VERSION, ctx);

      expect(result).toEqual(data);
    });

    it('should handle resource name case sensitivity', () => {
      const data = {
        id: '123',
        name: 'Test',
      };

      // Control is supported, but Control (capitalized) is not
      const result = versionResponse('Control', data, CURRENT_API_VERSION, ctx);

      expect(result).toEqual(data);
    });

    it('should handle different version formats for unsupported resources', () => {
      const data = {
        id: '123',
        name: 'Test',
      };

      const result1 = versionResponse('risk', data, '2025-10-10', ctx);
      const result2 = versionResponse('risk', data, '2025-09-01', ctx);
      const result3 = versionResponse('risk', data, CURRENT_API_VERSION, ctx);

      expect(result1).toEqual(data);
      expect(result2).toEqual(data);
      expect(result3).toEqual(data);
    });

    it('should pass context through without modification', () => {
      const data = {
        id: '123',
        name: 'Test',
      };

      // Should not throw even though ctx is passed
      expect(() => {
        versionResponse('risk', data, CURRENT_API_VERSION, ctx);
      }).not.toThrow();
    });

    it('should handle complex data structures for unsupported resources', () => {
      const data = {
        id: '123',
        nested: {
          level1: {
            level2: {
              value: 'deep',
            },
          },
        },
        array: [
          { id: 1, name: 'item1' },
          { id: 2, name: 'item2' },
        ],
        mixed: ['string', 123, { key: 'value' }, [1, 2, 3]],
      };

      const result = versionResponse('risk', data, CURRENT_API_VERSION, ctx);

      expect(result).toEqual(data);
    });
  });

  describe('versionResponseList', () => {
    const ctx = {
      basePath: '/api/v1',
      requestId: 'test-request-123',
    };

    it('should return empty array unchanged', () => {
      const dataArray: unknown[] = [];

      const result = versionResponseList(
        'risk',
        dataArray,
        CURRENT_API_VERSION,
        ctx
      );

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should transform single item array for unsupported resource', () => {
      const dataArray = [{ id: '123', name: 'Risk 1' }];

      const result = versionResponseList('risk', dataArray, '2025-10-10', ctx);

      expect(result).toEqual(dataArray);
      expect(result).toHaveLength(1);
    });

    it('should transform multiple items array for unsupported resource', () => {
      const dataArray = [
        { id: '1', name: 'Risk 1', severity: 'high' },
        { id: '2', name: 'Risk 2', severity: 'medium' },
        { id: '3', name: 'Risk 3', severity: 'low' },
      ];

      const result = versionResponseList('risk', dataArray, '2025-10-10', ctx);

      expect(result).toEqual(dataArray);
      expect(result).toHaveLength(3);
    });

    it('should handle large arrays efficiently', () => {
      const largeArray = Array.from({ length: 100 }, (_, i) => ({
        id: `id-${i}`,
        name: `Item ${i}`,
        value: i,
      }));

      const result = versionResponseList(
        'risk',
        largeArray,
        CURRENT_API_VERSION,
        ctx
      );

      expect(result).toEqual(largeArray);
      expect(result).toHaveLength(100);
    });

    it('should handle array with null values', () => {
      const dataArray = [
        { id: '1', name: 'Item 1', value: null },
        { id: '2', name: null, value: 'value2' },
      ];

      const result = versionResponseList('risk', dataArray, '2025-10-10', ctx);

      expect(result).toEqual(dataArray);
    });

    it('should handle array with mixed types for unsupported resource', () => {
      const dataArray = [
        { id: '1', type: 'type1', data: { nested: true } },
        { id: '2', type: 'type2', data: 'string' },
        { id: '3', type: 'type3', data: [1, 2, 3] },
      ];

      const result = versionResponseList(
        'risk',
        dataArray,
        CURRENT_API_VERSION,
        ctx
      );

      expect(result).toEqual(dataArray);
      expect(result).toHaveLength(3);
    });

    it('should handle array for different unsupported resource types', () => {
      const dataArray = [
        { id: '1', name: 'Action 1' },
        { id: '2', name: 'Action 2' },
      ];

      const result = versionResponseList(
        'action',
        dataArray,
        '2025-10-10',
        ctx
      );

      expect(result).toEqual(dataArray);
    });

    it('should handle arrays with deeply nested objects', () => {
      const dataArray = [
        {
          id: '1',
          nested: {
            level1: {
              level2: {
                value: 'deep1',
              },
            },
          },
        },
        {
          id: '2',
          nested: {
            level1: {
              level2: {
                value: 'deep2',
              },
            },
          },
        },
      ];

      const result = versionResponseList(
        'risk',
        dataArray,
        CURRENT_API_VERSION,
        ctx
      );

      expect(result).toEqual(dataArray);
    });

    it('should maintain array order', () => {
      const dataArray = [
        { id: '5', order: 5 },
        { id: '1', order: 1 },
        { id: '3', order: 3 },
        { id: '2', order: 2 },
        { id: '4', order: 4 },
      ];

      const result = versionResponseList('risk', dataArray, '2025-10-10', ctx);

      expect(result).toEqual(dataArray);
      expect(result.map((item) => item.id)).toEqual(['5', '1', '3', '2', '4']);
    });

    it('should handle very large arrays without errors', () => {
      const veryLargeArray = Array.from({ length: 1000 }, (_, i) => ({
        id: `id-${i}`,
        value: i,
      }));

      const result = versionResponseList(
        'risk',
        veryLargeArray,
        CURRENT_API_VERSION,
        ctx
      );

      expect(result).toHaveLength(1000);
      expect(result[0]).toEqual({ id: 'id-0', value: 0 });
      expect(result[999]).toEqual({ id: 'id-999', value: 999 });
    });

    it('should handle arrays with empty objects', () => {
      const dataArray = [{}, {}, {}];

      const result = versionResponseList('risk', dataArray, '2025-10-10', ctx);

      expect(result).toEqual(dataArray);
      expect(result).toHaveLength(3);
    });
  });
});
