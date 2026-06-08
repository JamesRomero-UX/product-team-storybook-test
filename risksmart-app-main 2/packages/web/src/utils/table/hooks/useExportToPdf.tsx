import type { PropertyFilterQuery } from '@cloudscape-design/collection-hooks';
import type { FormConfigurationPartsFragment } from '@risksmart-app/web-graphql-client/generated/graphql';
import useEntityInfo from 'src/hooks/getEntityInfo';

import { recordsToExportArray } from '@/utils/table/utils/tableExport';

import type { TableFields, TableRecord } from '../types';
import { useFormConfigRegistry } from './form/useFormConfigRegistry';

interface UseExportToPdfProps<T extends TableRecord> {
  tableProps: {
    allItems: readonly T[] | undefined;
    items?: readonly T[] | undefined; // Add filtered items
    filteringProperties: readonly unknown[];
    propertyFilterQuery: PropertyFilterQuery;
    visibleColumns?: readonly string[];
    visibleColumnsPreference?: readonly string[];
    sorting?: unknown;
    fields: TableFields<T>;
    entityLabel: string;
    formConfigurations?: FormConfigurationPartsFragment[] | null;
  };
}

interface FilterToken {
  property: string;
  operator: string;
  value: string;
  operation?: 'and' | 'or'; // The operation that connects this token to the next
}

interface UseExportToPdfReturn {
  exportToCsvString: () => string;
  generateTableData: () => {
    headers: string[];
    rows: (string | number)[][];
    // Optional matrix of per-cell styles aligned with rows (no header row)
    cellStyles?: Array<
      Array<
        | null
        | undefined
        | {
            backgroundColor?: string;
            color?: string;
          }
      >
    >;
    metadata: {
      totalCount: number;
      filteredCount: number;
      exportedAt?: string;
      entityLabel: string;
      hasFilters: boolean;
      filterInfo?: string;
      appliedFilters?: FilterToken[];
    };
  };
}

// Helper function to extract filter tokens from PropertyFilterQuery
const extractFilterTokens = (
  propertyFilterQuery: PropertyFilterQuery,
  filteringProperties: readonly unknown[]
): FilterToken[] => {
  const tokens: FilterToken[] = [];

  if (!propertyFilterQuery.tokens && !propertyFilterQuery.tokenGroups) {
    return tokens;
  }

  // Find property label from filteringProperties
  const getPropertyLabel = (propertyKey: string): string => {
    const property = (
      filteringProperties as {
        key: string;
        label?: string;
        propertyLabel?: string;
      }[]
    )?.find((prop) => prop.key === propertyKey);

    return property?.label ?? property?.propertyLabel ?? propertyKey;
  };

  // Get the main operation (and/or) for the query
  const mainOperation = propertyFilterQuery.operation || 'and';

  // Process direct tokens
  if (propertyFilterQuery.tokens) {
    propertyFilterQuery.tokens.forEach((token, index) => {
      if (token.propertyKey && token.value && token.operator) {
        tokens.push({
          property: getPropertyLabel(token.propertyKey),
          operator: token.operator,
          value: String(token.value),
          // Add operation to all tokens except the last one
          operation:
            index < propertyFilterQuery.tokens!.length - 1
              ? mainOperation
              : undefined,
        });
      }
    });
  }

  // Process token groups
  if (propertyFilterQuery.tokenGroups) {
    propertyFilterQuery.tokenGroups.forEach((group, groupIndex) => {
      if ('tokens' in group && group.tokens) {
        const groupOperation =
          ('operation' in group ? group.operation : undefined) || 'and';

        group.tokens.forEach((token, tokenIndex) => {
          if (
            'propertyKey' in token &&
            token.propertyKey &&
            token.value &&
            token.operator
          ) {
            const isLastTokenInGroup = tokenIndex === group.tokens!.length - 1;
            const isLastGroup =
              groupIndex === propertyFilterQuery.tokenGroups!.length - 1;
            const hasMoreMainTokens =
              propertyFilterQuery.tokens &&
              propertyFilterQuery.tokens.length > 0;

            tokens.push({
              property: getPropertyLabel(token.propertyKey),
              operator: token.operator,
              value: String(token.value),
              // Use group operation between tokens in the same group
              // Use main operation between groups or to connect to main tokens
              operation: !isLastTokenInGroup
                ? groupOperation
                : !isLastGroup || hasMoreMainTokens
                  ? mainOperation
                  : undefined,
            });
          }
        });
      }
    });
  }

  return tokens;
};

export const useExportToPdf = <T extends TableRecord>({
  tableProps,
}: UseExportToPdfProps<T>): UseExportToPdfReturn => {
  const formRegistry = useFormConfigRegistry();
  const getEntityInfo = useEntityInfo();
  // Generate table export data directly from tableProps
  const generateTableData = () => {
    // Use filtered items if available, otherwise fall back to all items
    const items = tableProps.items || tableProps.allItems || [];
    const allItems = tableProps.allItems || [];
    const fields = tableProps.fields;
    let visibleColumns = tableProps.visibleColumns;

    // Fallback: if visibleColumns is empty or undefined, use field keys
    if (!visibleColumns || visibleColumns.length === 0) {
      visibleColumns = Object.keys(fields);
    }

    // Validate that visibleColumns exist in fields
    const validVisibleColumns = visibleColumns.filter((col) => fields[col]);
    if (validVisibleColumns.length === 0) {
      console.warn('No valid visible columns found, using all field keys');
      visibleColumns = Object.keys(fields);
    } else if (validVisibleColumns.length !== visibleColumns.length) {
      const missingColumns = visibleColumns.filter((col) => !fields[col]);
      console.warn('Some visible columns not found in fields:', missingColumns);
      visibleColumns = validVisibleColumns;
    }

    const exportData = recordsToExportArray(items, fields, visibleColumns, {
      formConfigurations: tableProps.formConfigurations ?? null,
      formRegistry,
      getEntityInfo,
    });
    const [headers, ...rows] = exportData;

    // Detect an optional footer/totals row appended by recordsToExportArray.
    // If present and entirely empty, drop it; if it has any value, keep it
    // but exclude it from the item count by adjusting metadata below.
    const isEmptyCell = (v: unknown): boolean =>
      v == null || (typeof v === 'string' && v.trim() === '');
    let hasTotalsRow = false;
    let rowsForPdf = rows as (string | number)[][];
    if (rowsForPdf.length > items.length) {
      const last = rowsForPdf[rowsForPdf.length - 1];
      const isEmptyRow = Array.isArray(last) && last.every(isEmptyCell);
      if (isEmptyRow) {
        rowsForPdf = rowsForPdf.slice(0, -1);
      } else {
        hasTotalsRow = true;
      }
    }

    // Build cellStyles matrix aligned with rows: items x visibleColumns
    const cellStyles = items.map((item) =>
      (visibleColumns as string[]).map((fieldName) => {
        const field = fields[fieldName as keyof typeof fields];
        if (!field || typeof field.exportCellStyle !== 'function') {
          return null;
        }
        try {
          return field.exportCellStyle(item as T) ?? null;
        } catch {
          return null;
        }
      })
    );

    // Determine if any filters are applied either by query tokens/groups or by item count diff
    const hasQueryTokens = Boolean(
      (tableProps.propertyFilterQuery.tokens &&
        tableProps.propertyFilterQuery.tokens.length > 0) ||
      (tableProps.propertyFilterQuery.tokenGroups &&
        tableProps.propertyFilterQuery.tokenGroups.length > 0)
    );
    const hasCountDiff = items.length !== allItems.length;
    // Treat presence of a totals row as a condition to surface an explicit count label
    // so the backend doesn't fall back to rows.length (which would include totals row).
    const hasFilters = hasQueryTokens || hasCountDiff || hasTotalsRow;

    // Extract applied filter tokens (based on query), independent of count diff
    const appliedFilters = hasQueryTokens
      ? extractFilterTokens(
          tableProps.propertyFilterQuery,
          tableProps.filteringProperties
        )
      : [];

    return {
      headers: headers as string[],
      rows: rowsForPdf as (string | number)[][],
      cellStyles,
      metadata: {
        totalCount: allItems.length,
        filteredCount: items.length,
        entityLabel: tableProps.entityLabel,
        hasFilters,
        // Only append the "(filtered)" suffix when there are actual query tokens or count diffs.
        // When only a totals row is present, show an unqualified count so it reads naturally.
        filterInfo:
          hasQueryTokens || hasCountDiff
            ? `Showing ${items.length} of ${allItems.length} items (filtered)`
            : `Showing all ${items.length} items`,
        appliedFilters,
      },
    };
  };

  const exportToCsvString = (): string => {
    try {
      const { headers, rows } = generateTableData();
      // Convert to CSV format for backwards compatibility
      // RFC 4180: escape double quotes by doubling them and quote fields containing
      // commas, double quotes, or newlines
      const escapeCsvCell = (cell: string | number): string => {
        const str = String(cell);
        const needsQuotes = /[",\n\r]/.test(str);
        const escaped = str.replace(/"/g, '""');

        return needsQuotes ? `"${escaped}"` : escaped;
      };

      const csvHeader = headers.map(escapeCsvCell).join(',');
      const csvRows = rows.map((row) => row.map(escapeCsvCell).join(','));

      return [csvHeader, ...csvRows].join('\n');
    } catch (e) {
      console.error('CSV export error:', e);

      return '';
    }
  };

  return {
    exportToCsvString,
    generateTableData,
  };
};
