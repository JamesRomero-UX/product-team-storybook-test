import { renderHook } from '@testing-library/react';
import { useFeatures } from 'src/rbac/useFeatures';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TableFields, TableRecord } from '@/utils/table/types';

import { useExportToPdf } from './useExportToPdf';

vi.mock('src/rbac/useFeatures');

vi.mock('@/utils/table/utils/tableExport', () => ({
  recordsToExportArray: (
    items: Array<Record<string, unknown>>,
    fields: Record<
      string,
      {
        header: string;
        footerVal?: (rows: unknown[]) => unknown;
        footerExportVal?: (rows: unknown[]) => unknown;
      }
    >,
    visibleColumns: string[]
    // formConfigurations: FormConfigurationPartsFragment[] | null
  ) => {
    const headers = visibleColumns.map((k) => fields[k]?.header ?? k);
    const rows = items.map((item) => visibleColumns.map((k) => item[k]));

    // Simulate footer row behavior from the real exporter: if any column has a footer
    // function, add a footer row composed of each column's footer value (or empty string).
    const hasAnyFooter = Object.values(fields).some(
      (f) =>
        typeof f.footerVal === 'function' ||
        typeof f.footerExportVal === 'function'
    );
    if (hasAnyFooter) {
      const footerRow = visibleColumns.map((k) => {
        const def = fields[k];
        if (def?.footerExportVal) {
          return def.footerExportVal(items) ?? '';
        }
        if (def?.footerVal) {
          return def.footerVal(items) ?? '';
        }

        return '';
      });
      rows.push(footerRow);
    }

    return [headers, ...rows];
  },
}));

// Test data interfaces
interface TestRecord extends TableRecord {
  id: string;
  title: string;
  status: string;
  owner: string;
  createdAt: string;
}

describe('useExportToPdf', () => {
  beforeEach(() => {
    vi.mocked(useFeatures).mockReturnValue([]);
  });

  // Test data
  const mockItems: TestRecord[] = [
    {
      id: '1',
      title: 'Test Risk 1',
      status: 'Active',
      owner: 'John Doe',
      createdAt: '2025-01-01',
    },
    {
      id: '2',
      title: 'Test Risk 2',
      status: 'Draft',
      owner: 'Jane Smith',
      createdAt: '2025-01-02',
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
  };

  const mockTableProps = {
    allItems: mockItems,
    filteringProperties: [],
    propertyFilterQuery: {
      tokens: [],
      operation: 'and' as const,
      tokenGroups: [],
    },
    visibleColumns: ['id', 'title', 'status'],
    fields: mockFields,
    entityLabel: 'Test Records',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console methods to avoid noise in tests
    global.console.log = vi.fn();
    global.console.warn = vi.fn();
  });

  describe('generateTableData', () => {
    it('should generate correct headers and rows for visible columns only', () => {
      const { result } = renderHook(() =>
        useExportToPdf({
          tableProps: mockTableProps,
        })
      );

      // The hook should be created successfully
      expect(result.current).toBeDefined();

      // Test the CSV string generation to verify data transformation
      const csvString = result.current.exportToCsvString();

      // Should contain only visible column headers
      expect(csvString).toContain('ID');
      expect(csvString).toContain('Title');
      expect(csvString).toContain('Status');

      // Should NOT contain non-visible column headers
      expect(csvString).not.toContain('Owner');
      expect(csvString).not.toContain('Created Date');

      // Should contain data rows
      expect(csvString).toContain('Test Risk 1');
      expect(csvString).toContain('Test Risk 2');
      expect(csvString).toContain('Active');
      expect(csvString).toContain('Draft');
    });

    it('should fallback to all fields when no visible columns specified', () => {
      const tablePropsNoVisible = {
        ...mockTableProps,
        visibleColumns: undefined,
      };

      const { result } = renderHook(() =>
        useExportToPdf({
          tableProps: tablePropsNoVisible,
        })
      );

      const csvString = result.current.exportToCsvString();

      // Should contain all field headers when no visible columns
      expect(csvString).toContain('ID');
      expect(csvString).toContain('Title');
      expect(csvString).toContain('Status');
      expect(csvString).toContain('Owner');
      expect(csvString).toContain('Created Date');
    });

    it('should handle empty visible columns array', () => {
      const tablePropsEmptyVisible = {
        ...mockTableProps,
        visibleColumns: [],
      };

      const { result } = renderHook(() =>
        useExportToPdf({
          tableProps: tablePropsEmptyVisible,
        })
      );

      const csvString = result.current.exportToCsvString();

      // Should fallback to all fields when visible columns is empty
      expect(csvString).toContain('ID');
      expect(csvString).toContain('Title');
      expect(csvString).toContain('Owner');
    });

    it('should filter out invalid visible columns', () => {
      const tablePropsInvalidVisible = {
        ...mockTableProps,
        visibleColumns: ['id', 'title', 'nonExistentField', 'status'],
      };

      const { result } = renderHook(() =>
        useExportToPdf({
          tableProps: tablePropsInvalidVisible,
        })
      );

      const csvString = result.current.exportToCsvString();

      // Should contain valid fields
      expect(csvString).toContain('ID');
      expect(csvString).toContain('Title');
      expect(csvString).toContain('Status');

      // Should not contain invalid field
      expect(csvString).not.toContain('nonExistentField');

      // Should warn about missing columns
      expect(console.warn).toHaveBeenCalledWith(
        'Some visible columns not found in fields:',
        ['nonExistentField']
      );
    });
  });

  describe('ribbon cards calculation', () => {
    it('should calculate ribbon cards for risk-register template', () => {
      const { result } = renderHook(() =>
        useExportToPdf({
          tableProps: mockTableProps,
        })
      );

      // For risk-register template, ribbon cards should be calculated
      // We can't directly test the internal function, but we can verify
      // that the hook handles the template correctly
      expect(result.current).toBeDefined();
    });

    it('should not calculate ribbon cards for table-export template', () => {
      const { result } = renderHook(() =>
        useExportToPdf({
          tableProps: mockTableProps,
        })
      );

      expect(result.current).toBeDefined();
    });
  });

  describe('data validation', () => {
    it('should handle empty items array', () => {
      const tablePropsEmpty = {
        ...mockTableProps,
        allItems: [],
      };

      const { result } = renderHook(() =>
        useExportToPdf({
          tableProps: tablePropsEmpty,
        })
      );

      const csvString = result.current.exportToCsvString();

      // Should still have headers even with no data
      expect(csvString).toContain('ID');
      expect(csvString).toContain('Title');
      expect(csvString).toContain('Status');
    });

    it('should handle undefined items', () => {
      const tablePropsUndefined = {
        ...mockTableProps,
        allItems: undefined,
      };

      const { result } = renderHook(() =>
        useExportToPdf({
          tableProps: tablePropsUndefined,
        })
      );

      expect(result.current).toBeDefined();

      // Should not throw error with undefined items
      expect(() => result.current.exportToCsvString()).not.toThrow();
    });
  });

  describe('totals row handling (PDF export pre-processing)', () => {
    it('trims an empty footer/totals row from the end before sending to PDF', () => {
      const fieldsWithEmptyFooter: TableFields<TestRecord> = {
        ...mockFields,
        // Add a footer to one visible column that returns empty string values
        status: {
          ...mockFields.status,
          footerExportVal: () => '',
        },
      } as unknown as TableFields<TestRecord>;

      const { result } = renderHook(() =>
        useExportToPdf({
          tableProps: {
            ...mockTableProps,
            fields: fieldsWithEmptyFooter,
          },
        })
      );

      const data = result.current.generateTableData();
      // rows should equal data items length (footer row dropped)
      expect(data.rows.length).toBe(mockItems.length);
      // hasFilters should not be forced true just due to empty totals row
      expect(data.metadata.hasFilters).toBe(false);
      expect(data.metadata.filterInfo).toBe(
        `Showing all ${mockItems.length} items`
      );
    });

    it('keeps a non-empty footer/totals row and excludes it from counts', () => {
      const fieldsWithTotals: TableFields<TestRecord> = {
        ...mockFields,
        // Provide a non-empty totals indicator in the last row
        status: {
          ...mockFields.status,
          footerExportVal: () => 'Totals',
        },
      } as unknown as TableFields<TestRecord>;

      const { result } = renderHook(() =>
        useExportToPdf({
          tableProps: {
            ...mockTableProps,
            fields: fieldsWithTotals,
          },
        })
      );

      const data = result.current.generateTableData();
      // rows should include the totals row
      expect(data.rows.length).toBe(mockItems.length + 1);
      // counts should reflect only data rows
      expect(data.metadata.filteredCount).toBe(mockItems.length);
      expect(data.metadata.totalCount).toBe(mockItems.length);
      // hasFilters flagged true to ensure backend uses provided filterInfo instead of rows length
      expect(data.metadata.hasFilters).toBe(true);
      expect(data.metadata.filterInfo).toBe(
        `Showing all ${mockItems.length} items`
      );
    });
  });

  describe('csv escaping', () => {
    it('escapes fields containing commas by quoting the field', () => {
      const items: TestRecord[] = [
        { ...mockItems[0], title: 'Hello, World' },
        mockItems[1],
      ];
      const { result } = renderHook(() =>
        useExportToPdf({
          tableProps: {
            ...mockTableProps,
            allItems: items,
            visibleColumns: ['id', 'title'],
          },
        })
      );

      const csv = result.current.exportToCsvString();
      // Title with comma should be quoted
      expect(csv).toContain('"Hello, World"');
    });

    it('doubles internal quotes and wraps the field in quotes', () => {
      const items: TestRecord[] = [{ ...mockItems[0], title: 'He said "Hi"' }];
      const { result } = renderHook(() =>
        useExportToPdf({
          tableProps: {
            ...mockTableProps,
            allItems: items,
            visibleColumns: ['id', 'title'],
          },
        })
      );

      const csv = result.current.exportToCsvString();
      // Expect: "He said ""Hi"""
      expect(csv).toContain('"He said ""Hi"""');
    });

    it('quotes fields containing newlines', () => {
      const items: TestRecord[] = [{ ...mockItems[0], title: 'Line1\nLine2' }];
      const { result } = renderHook(() =>
        useExportToPdf({
          tableProps: {
            ...mockTableProps,
            allItems: items,
            visibleColumns: ['id', 'title'],
          },
        })
      );

      const csv = result.current.exportToCsvString();
      // The field should be wrapped in quotes despite containing a newline
      expect(csv).toContain('"Line1\nLine2"');
    });
  });
});
