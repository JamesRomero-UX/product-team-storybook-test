// (top block removed; see separate array-handling test file)
import { getFormConfigRegistry } from '@risksmart-app/shared/forms/formConfigRegistry';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TableFields, TableRecord } from '../types';
import { recordsToExportArray } from './tableExport';

// Test data interface
interface TestRecord extends TableRecord {
  id: string;
  title: string;
  status: string;
  owner: string;
  createdAt: string;
  count: number;
}

describe('recordsToExportArray', () => {
  const formRegistry = getFormConfigRegistry([]);

  // Test data
  const mockItems: TestRecord[] = [
    {
      id: '1',
      title: 'Test Risk 1',
      status: 'Active',
      owner: 'John Doe',
      createdAt: '2025-01-01',
      count: 5,
    },
    {
      id: '2',
      title: 'Test Risk 2',
      status: 'Draft',
      owner: 'Jane Smith',
      createdAt: '2025-01-02',
      count: 10,
    },
  ];

  const mockFields: TableFields<TestRecord> = {
    id: {
      header: 'ID',
      exportVal: (item) => item.id,
    },
    title: {
      header: 'Title',
      exportVal: (item) => item.title,
    },
    status: {
      header: 'Status',
      exportVal: (item) => item.status,
    },
    owner: {
      header: 'Owner',
      exportVal: (item) => item.owner,
    },
    createdAt: {
      header: 'Created Date',
      exportVal: (item) => item.createdAt,
    },
    count: {
      header: 'Count',
      // No exportVal - should use direct property access
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.console.log = vi.fn();
    global.console.warn = vi.fn();
  });

  const getEntityInfo = () => ({ singular: 'risk' });

  describe('with visible columns specified', () => {
    it('should only export specified visible columns', () => {
      const visibleColumns = ['id', 'title', 'status'];

      const result = recordsToExportArray(
        mockItems,
        mockFields,
        visibleColumns,
        {
          formConfigurations: null,
          formRegistry,
          getEntityInfo,
        }
      );

      // Should have header row + data rows
      expect(result).toHaveLength(3); // 1 header + 2 data rows

      // Check headers (first row)
      const headers = result[0];
      expect(headers).toEqual(['ID', 'Title', 'Status']);
      expect(headers).not.toContain('Owner');
      expect(headers).not.toContain('Created Date');

      // Check first data row
      const firstRow = result[1];
      expect(firstRow).toEqual(['1', 'Test Risk 1', 'Active']);

      // Check second data row
      const secondRow = result[2];
      expect(secondRow).toEqual(['2', 'Test Risk 2', 'Draft']);
    });

    it('should handle fields with exportVal function', () => {
      const visibleColumns = ['id', 'title'];

      const result = recordsToExportArray(
        mockItems,
        mockFields,
        visibleColumns,
        {
          formConfigurations: null,
          formRegistry,
          getEntityInfo,
        }
      );

      expect(result[0]).toEqual(['ID', 'Title']);
      expect(result[1]).toEqual(['1', 'Test Risk 1']);
      expect(result[2]).toEqual(['2', 'Test Risk 2']);
    });

    it('should handle fields without exportVal (direct property access)', () => {
      const visibleColumns = ['count'];

      const result = recordsToExportArray(
        mockItems,
        mockFields,
        visibleColumns,
        {
          formConfigurations: null,
          formRegistry,
          getEntityInfo,
        }
      );

      expect(result[0]).toEqual(['Count']);
      expect(result[1]).toEqual([5]);
      expect(result[2]).toEqual([10]);
    });

    it('should skip fields that do not exist in fields object', () => {
      const visibleColumns = ['id', 'nonExistentField', 'title'];

      const result = recordsToExportArray(
        mockItems,
        mockFields,
        visibleColumns,
        {
          formConfigurations: null,
          formRegistry,
          getEntityInfo,
        }
      );

      // Should only include existing fields
      expect(result[0]).toEqual(['ID', 'Title']);
      expect(result[1]).toEqual(['1', 'Test Risk 1']);

      // Should warn about missing field
      expect(console.warn).toHaveBeenCalledWith(
        'Field nonExistentField not found in fields object'
      );
    });
  });

  describe('without visible columns specified', () => {
    it('should export all fields when visibleColumns is undefined', () => {
      const result = recordsToExportArray(mockItems, mockFields, undefined, {
        formConfigurations: null,
        formRegistry,
        getEntityInfo,
      });

      // Should have all field headers
      const headers = result[0];
      expect(headers).toContain('ID');
      expect(headers).toContain('Title');
      expect(headers).toContain('Status');
      expect(headers).toContain('Owner');
      expect(headers).toContain('Created Date');
      expect(headers).toContain('Count');

      // Should have 6 columns (all fields)
      expect(headers).toHaveLength(6);
    });

    it('should export all fields when visibleColumns is empty array', () => {
      const result = recordsToExportArray(mockItems, mockFields, [], {
        formConfigurations: null,
        formRegistry,
        getEntityInfo,
      });

      // Should use all fields as fallback
      const headers = result[0];
      expect(headers).toHaveLength(6);
      expect(headers).toContain('ID');
      expect(headers).toContain('Title');
    });
  });

  describe('edge cases', () => {
    it('should handle empty items array', () => {
      const visibleColumns = ['id', 'title'];

      const result = recordsToExportArray([], mockFields, visibleColumns, {
        formConfigurations: null,
        formRegistry,
        getEntityInfo,
      });

      // Should still have headers
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(['ID', 'Title']);
    });

    it('should handle missing properties in items', () => {
      const itemsWithMissingProps = [
        { id: '1', title: 'Test' }, // missing other properties
      ] as TestRecord[];

      const visibleColumns = ['id', 'title', 'count'];

      const result = recordsToExportArray(
        itemsWithMissingProps,
        mockFields,
        visibleColumns,
        {
          formConfigurations: null,
          formRegistry,
          getEntityInfo,
        }
      );

      expect(result[0]).toEqual(['ID', 'Title', 'Count']);
      // Missing properties should be included as undefined
      expect(result[1]).toEqual(['1', 'Test', undefined]);
    });

    it('should handle null and undefined values', () => {
      const itemsWithNulls = [
        {
          id: null,
          title: undefined,
          status: 'Active',
          owner: '',
          createdAt: '2025-01-01',
          count: 0,
        },
      ] as unknown as TestRecord[];

      const visibleColumns = ['id', 'title', 'status', 'count'];

      const result = recordsToExportArray(
        itemsWithNulls,
        mockFields,
        visibleColumns,
        {
          formConfigurations: null,
          formRegistry,
          getEntityInfo,
        }
      );

      expect(result[1]).toEqual([null, undefined, 'Active', 0]);
    });
  });

  describe('function behavior', () => {
    it('should process data correctly', () => {
      const visibleColumns = ['id', 'title'];

      const result = recordsToExportArray(
        mockItems,
        mockFields,
        visibleColumns,
        {
          formConfigurations: null,
          formRegistry,
          getEntityInfo,
        }
      );

      // Should have correct structure
      expect(result).toHaveLength(3); // header + 2 data rows
      expect(result[0]).toEqual(['ID', 'Title']);
      expect(result[1]).toEqual(['1', 'Test Risk 1']);
      expect(result[2]).toEqual(['2', 'Test Risk 2']);
    });

    it('should join array values into a single cell when exporting', () => {
      type TestRecordWithArray = TestRecord & { tags?: string[] };
      const items: TestRecordWithArray[] = [
        { ...(mockItems[0] as TestRecord), tags: ['Alpha', 'Beta'] },
        { ...(mockItems[1] as TestRecord), tags: ['Gamma'] },
      ];

      const fields: TableFields<TestRecordWithArray> = {
        ...(mockFields as unknown as TableFields<TestRecordWithArray>),
        tags: { header: 'Tags' },
      } as TableFields<TestRecordWithArray>;

      const result = recordsToExportArray(items, fields, ['id', 'tags'], {
        formConfigurations: null,
        formRegistry,
        getEntityInfo,
      });

      expect(result[0]).toEqual(['ID', 'Tags']);
      expect(result[1]).toEqual(['1', 'Alpha,Beta']);
      expect(result[2]).toEqual(['2', 'Gamma']);
    });

    it('should use exportVal returning array and preserve numeric zero values', () => {
      type Rec = TestRecord & {
        ControlledRatingHistory: { date: string; label: string }[];
        UncontrolledScore: number | null;
      };

      const items: Rec[] = [
        {
          ...(mockItems[0] as TestRecord),
          ControlledRatingHistory: [
            { date: '2025-01-01', label: 'High' },
            { date: '2025-02-01', label: 'Medium' },
          ],
          UncontrolledScore: 0,
        },
      ];

      const fields: TableFields<Rec> = {
        ...(mockFields as unknown as TableFields<Rec>),
        ControlledRatingHistory: {
          header: 'controlled_rating_history',
          exportVal: (item) =>
            item.ControlledRatingHistory.map(
              (c) => `${c.date} ${c.label}`
            ).join(','),
        },
        UncontrolledScore: { header: 'inherent_score' },
      } as TableFields<Rec>;

      const result = recordsToExportArray(
        items,
        fields,
        ['id', 'ControlledRatingHistory', 'UncontrolledScore'],
        {
          formConfigurations: null,
          formRegistry,
          getEntityInfo,
        }
      );

      expect(result[0]).toEqual([
        'ID',
        'controlled_rating_history',
        'inherent_score',
      ]);
      expect(result[1]).toEqual(['1', '2025-01-01 High,2025-02-01 Medium', 0]);
    });
  });
});
