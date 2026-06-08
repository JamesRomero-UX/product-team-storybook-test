import { useAxiosStore } from '@risksmart-app/components/src/hooks/useAxios';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import { getOrganization } from '@risksmart-app/components/src/utils/authUtils';
import dayjs from 'dayjs';
import { isEqual } from 'lodash';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { FilterModal } from '@/components/customisable-ribbon/customisableRibbonModalSchema';
import { handleError } from '@/utils/errorUtils';
import { applyTokenFilter } from '@/utils/filters/tokenFilter';
import { useExportToPdf } from '@/utils/table/hooks/useExportToPdf';
import type {
  TableFields,
  TablePropsWithActions,
  TableRecord,
} from '@/utils/table/types';

interface UsePagePdfExportOptions<T extends TableRecord> {
  tableProps: TablePropsWithActions<T>;
  fields: TableFields<T>;
  ribbonFilters?: FilterModal[];
  pdfTemplateId?: string;
  entityLabel: string;
}

interface PdfGenerationRequest {
  templateId: string;
  data: {
    entityLabel: string;
    headers: string[];
    rows: (string | number)[][];
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
    columnWidthRatios?: number[]; // Optional relative column widths (sum ~= 1) matching headers order
    metadata?: {
      totalCount?: number;
      exportedAt?: string;
      // Full filter query from the table; backend renders it
      filters?: unknown;
      // Map of propertyKey -> human-friendly label
      filterPropertyLabels?: Record<string, string>;
    };
    ribbonData?: {
      cards: Array<{
        title: string;
        value: string | number;
        filterQuery?: Record<string, unknown>;
      }>;
    };
  };
  options?: {
    title?: string;
    subtitle?: string;
    filename?: string;
    orientation?: 'landscape' | 'portrait';
  };
}

interface PdfGenerationResponse {
  success: boolean;
  taskId: string;
  status: string;
  downloadUrl?: string;
  token?: { sig: string; exp: number };
}

interface PdfStatusResponse {
  success: boolean;
  status: string;
  downloadUrl?: string;
  contentType?: string;
  filename?: string;
  error?: string;
}

// Tweakable weight for the last column when computing PDF column width ratios.
// Increase (>1) to make the last column wider; decrease (<1) to make it narrower.
// Has no effect on the UI, only influences PDF export ratios.
const LAST_COLUMN_RATIO_WEIGHT = 2.5;

export function usePagePdfExport<T extends TableRecord>({
  tableProps,
  fields,
  ribbonFilters,
  pdfTemplateId = 'default-register',
  entityLabel,
}: UsePagePdfExportOptions<T>) {
  const { user } = useRisksmartUser();
  const orgName = getOrganization(user);
  // Derive visible columns from table preferences, falling back to all field keys
  const visibleColumns = useMemo(() => {
    // First try to get from table preferences
    const preferencesColumns =
      tableProps.preferenceDetails?.preferences?.contentDisplay
        ?.filter((c) => c.visible)
        .map((c) => c.id);

    if (preferencesColumns && preferencesColumns.length > 0) {
      return preferencesColumns;
    }

    // Fallback to visible columns from tableProps
    if (tableProps.visibleColumns && tableProps.visibleColumns.length > 0) {
      return tableProps.visibleColumns;
    }

    // Final fallback to all field keys
    return Object.keys(fields);
  }, [
    tableProps.preferenceDetails?.preferences?.contentDisplay,
    tableProps.visibleColumns,
    fields,
  ]);

  const { authorisedAxiosInstance: axios } = useAxiosStore();
  const { addNotification } = useNotifications();
  const { t } = useTranslation(['common']);

  const { exportToCsvString, generateTableData } = useExportToPdf({
    tableProps: {
      allItems: tableProps.allItems,
      items: tableProps.items, // Pass filtered items
      filteringProperties: tableProps.filteringProperties,
      propertyFilterQuery: tableProps.propertyFilterQuery,
      visibleColumns: visibleColumns,
      fields: fields,
      entityLabel: entityLabel,
      formConfigurations: tableProps.labelFormConfigurations ?? null,
    },
  });

  // Compute column width ratios from saved preferences for visible columns
  const columnWidthRatios = useMemo(() => {
    type ColumnWidthsMap = Record<string, number | undefined>;
    type PrefsCustom = { custom?: { columnWidths?: ColumnWidthsMap } };
    const prefs = tableProps.preferenceDetails
      ?.preferences as unknown as PrefsCustom;
    const customWidths = prefs?.custom?.columnWidths as
      | ColumnWidthsMap
      | undefined;

    // Baseline width to prevent zero-width columns dominating ratios
    const BASELINE = 1;
    // Compute the average of saved widths (if any) to use as a fair fallback
    const savedValues = visibleColumns
      .map((col) => customWidths?.[col])
      .filter(
        (n): n is number => typeof n === 'number' && isFinite(n) && n > 0
      );
    const avgSaved =
      savedValues.length > 0
        ? savedValues.reduce((a, b) => a + b, 0) / savedValues.length
        : undefined;

    // Build widths list aligned to visible columns
    const widths = visibleColumns.map((col) => {
      const saved = customWidths?.[col];
      if (typeof saved === 'number' && isFinite(saved) && saved > 0) {
        return saved;
      }

      // Fall back to the field minWidth if available to better reflect UI proportions
      const fieldMin = (
        fields as unknown as Record<string, { minWidth?: number }>
      )[col]?.minWidth;
      if (typeof fieldMin === 'number' && isFinite(fieldMin) && fieldMin > 0) {
        return fieldMin;
      }

      // If we have any saved widths, use their average so missing columns aren't tiny
      if (typeof avgSaved === 'number' && isFinite(avgSaved) && avgSaved > 0) {
        return avgSaved;
      }

      // Final fallback to a small baseline weight
      return BASELINE;
    });

    // Optionally weight the last column to fine-tune perceived balance in PDF,
    // but only when explicit saved widths aren't defined for all visible columns.
    const allHaveSaved = visibleColumns.every((col) => {
      return (
        typeof customWidths?.[col] === 'number' &&
        isFinite(customWidths[col] as number) &&
        (customWidths[col] as number) > 0
      );
    });
    if (
      !allHaveSaved &&
      widths.length > 0 &&
      Number.isFinite(LAST_COLUMN_RATIO_WEIGHT) &&
      LAST_COLUMN_RATIO_WEIGHT > 0
    ) {
      const lastIdx = widths.length - 1;
      widths[lastIdx] =
        widths[lastIdx]! * (LAST_COLUMN_RATIO_WEIGHT - widths.length * 0.15);
    }

    const sum = widths.reduce((acc, n) => acc + (isFinite(n) ? n : 0), 0);
    if (sum <= 0) {
      return undefined;
    }

    return widths.map((w) => Number((w / sum).toFixed(4)));
  }, [tableProps.preferenceDetails?.preferences, visibleColumns, fields]);

  // Calculate ribbon card data for risk register template
  const ribbonCards = useMemo(() => {
    if (!ribbonFilters) {
      return [];
    }

    return ribbonFilters.map((filter) => {
      // Apply the filter to count matching items
      let matchingCount = 0;

      if (filter.itemFilterQuery) {
        const hasTokens = filter.itemFilterQuery.tokens?.length > 0;
        const hasTokenGroups =
          (filter.itemFilterQuery.tokenGroups?.length ?? 0) > 0;

        if (!hasTokens && !hasTokenGroups) {
          // Empty filter means "All" - count everything
          matchingCount = tableProps.allItems?.length || 0;
        } else {
          // Apply token filters to count matching items
          matchingCount = (tableProps.allItems || []).filter((item: T) => {
            try {
              return applyTokenFilter(
                item,
                filter.itemFilterQuery,
                tableProps.filteringProperties
              );
            } catch {
              // If filter fails, don't count the item
              return false;
            }
          }).length;
        }
      } else {
        // If no filter query, assume it's "All" and count everything
        matchingCount = tableProps.allItems?.length || 0;
      }

      // Determine if this ribbon filter matches the current table filter (highlighted in UI)
      const ribbonQuery = {
        tokens: [...(filter.itemFilterQuery.tokens ?? [])],
        tokenGroups: filter.itemFilterQuery.tokenGroups
          ? [...filter.itemFilterQuery.tokenGroups]
          : undefined,
        operation: filter.itemFilterQuery.operation,
      };
      const isHighlighted = isEqual(
        ribbonQuery,
        tableProps.propertyFilterQuery
      );

      return {
        title: filter.title,
        value: matchingCount,
        filterQuery: filter.itemFilterQuery,
        highlighted: isHighlighted,
      };
    });
  }, [
    ribbonFilters,
    tableProps.allItems,
    tableProps.filteringProperties,
    tableProps.propertyFilterQuery,
  ]);

  const downloadPdf = useCallback(
    async (
      taskId: string,
      fallbackFilename: string,
      token?: { sig: string; exp: number }
    ): Promise<void> => {
      try {
        // Include desired filename so server can enforce it in proxy Content-Disposition
        const tokenQs = token
          ? `&sig=${encodeURIComponent(token.sig)}&exp=${encodeURIComponent(
              String(token.exp)
            )}`
          : '';
        const response = await axios.get<PdfStatusResponse>(
          `/pdf/status/${taskId}?filename=${encodeURIComponent(
            fallbackFilename
          )}${tokenQs}`
        );

        if (response.data.success && response.data.status === 'SUCCESS') {
          // Always prefer our generated filename and ensure correct extension
          // Guard against server-provided typos like .pfd or unexpected names
          const ensurePdfExtension = (name: string): string =>
            name.replace(/\.(pdf|pfd|pdF|PfD|PDF)?$/i, '').concat('.pdf');
          const filename = ensurePdfExtension(fallbackFilename);

          // Build a same-origin proxy URL so filename is honored via Content-Disposition
          const freshUrl = response.data.downloadUrl;
          // If backend provided a fully signed proxy URL, prefer it; otherwise build with token
          const proxyPath =
            typeof freshUrl === 'string' && freshUrl.includes('/pdf/download/')
              ? freshUrl
              : `/pdf/download/${taskId}?filename=${encodeURIComponent(
                  filename
                )}${tokenQs}`;

          // Prefer authenticated blob download to ensure custom filename is preserved
          try {
            const fileResp = await axios.get<Blob>(proxyPath, {
              responseType: 'blob',
            });
            const blobUrl = URL.createObjectURL(fileResp.data);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
          } catch {
            // Fallback to navigation download; same-origin ensures filename via header
            const link = document.createElement('a');
            link.href = proxyPath;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }

          addNotification({
            type: 'success',
            content: t('export.pdf_export_success', 'PDF export completed'),
          });
        } else {
          addNotification({
            type: 'error',
            content: t(
              'export.pdf_export_failed',
              'PDF export failed - please try again'
            ),
          });
        }
      } catch (error) {
        console.error('PDF download error:', error);
        addNotification({
          type: 'error',
          content: t(
            'export.pdf_export_failed',
            'PDF export failed - please try again'
          ),
        });
      }
    },
    [axios, addNotification, t]
  );

  type ExportOverrides = {
    titleOverride?: string;
    subtitleOverride?: string;
    hideRibbon?: boolean;
    orientation?: 'landscape' | 'portrait';
  };
  const exportToPdf = useCallback(
    async (overrides?: ExportOverrides): Promise<void> => {
      try {
        // Generate table data using the table hook
        const tableData = generateTableData();

        // Warn if too many columns may impact PDF layout
        const columnCount = Array.isArray(tableData.headers)
          ? tableData.headers.length
          : 0;
        const COLUMN_THRESHOLD = 10; // assumption: >10 columns may not format well

        // Prepare data based on template type
        const baseData = {
          entityLabel: tableData.metadata.entityLabel,
          headers: tableData.headers.map((h: unknown) =>
            h === null || h === undefined ? '' : String(h)
          ),
          rows: tableData.rows.map((row: unknown[]) =>
            row.map((cell: unknown) =>
              cell === null || cell === undefined ? '' : String(cell)
            )
          ),
          // pass optional cellStyles for PDF coloring
          cellStyles: tableData.cellStyles,
          metadata: {
            totalCount: tableData.metadata.totalCount,
            filteredCount: tableData.metadata.filteredCount,
            exportedAt: dayjs().toISOString(),
            hasFilters: tableData.metadata.hasFilters,
            filterInfo: tableData.metadata.filterInfo,
            appliedFilters: tableData.metadata.appliedFilters,
            // Map property keys -> human labels so the PDF renders labels, not keys
            filterPropertyLabels: Object.fromEntries(
              (
                (tableProps.filteringProperties as unknown as Array<{
                  key: string;
                  label?: string;
                  propertyLabel?: string;
                }>) || []
              ).map((p) => [p.key, p.label || p.propertyLabel || p.key])
            ),
            // Pass the full table filter query so the PDF can render a readable expression
            filters: tableProps.propertyFilterQuery,
          },
        };

        // Add ribbon data for ribbon register template
        const templateId = pdfTemplateId || 'default-register';
        const includeRibbon =
          !overrides?.hideRibbon &&
          (templateId !== 'default-register' || ribbonFilters !== undefined);

        const templateData = {
          ...baseData,
          // Thread through column width ratios to keep PDF layout similar to UI
          columnWidthRatios: columnWidthRatios,
          ...(includeRibbon
            ? {
                ribbonData: {
                  cards: ribbonCards,
                },
              }
            : {}),
        };

        const cleanLabel = entityLabel.toLowerCase().replace(/\s+/g, '-');
        const filename = `${cleanLabel}-${dayjs().format('YYYY-MM-DD-HH-mm-ss')}.pdf`;

        const requestData: PdfGenerationRequest = {
          templateId: templateId,
          data: templateData,
          options: {
            title: overrides?.titleOverride || templateData.entityLabel,
            subtitle:
              overrides?.subtitleOverride ||
              orgName ||
              dayjs().format('MMMM D, YYYY'),
            filename,
            // Bubble orientation hint to the service; backend can default if absent
            orientation: overrides?.orientation,
          },
        };

        if (columnCount > COLUMN_THRESHOLD) {
          addNotification({
            type: 'success',
            content: (
              <span style={{ whiteSpace: 'pre-line' }}>
                {t(
                  'export.pdf_many_columns_warning',
                  `PDF export started.\n\nThis export includes ${columnCount} columns.\nConsider reducing visible columns for a better result.`
                )}
              </span>
            ),
          });
        } else {
          addNotification({
            type: 'success',
            content: t('export.pdf_export_started', 'PDF export started...'),
          });
        }

        const response = await axios.post<PdfGenerationResponse>(
          '/pdf/generate',
          { input: requestData }
        );

        if (response.data.success && response.data.taskId) {
          // Download the completed PDF with the generated filename
          await downloadPdf(
            response.data.taskId,
            filename,
            response.data.token
          );
        } else {
          throw new Error('Failed to start PDF generation');
        }
      } catch (e) {
        console.error('PDF export error:', e);
        handleError(e);
        addNotification({
          type: 'error',
          content: t('export.pdf_export_failed', 'PDF export failed'),
        });
      }
    },
    [
      generateTableData,
      ribbonCards,
      entityLabel,
      pdfTemplateId,
      ribbonFilters,
      addNotification,
      t,
      axios,
      downloadPdf,
      columnWidthRatios,
      orgName,
      tableProps.propertyFilterQuery,
      tableProps.filteringProperties,
    ]
  );

  const exportToPdfString = useCallback(() => {
    // For backwards compatibility, return CSV data as string
    return exportToCsvString();
  }, [exportToCsvString]);

  return {
    exportToPdf,
    exportToPdfString,
  };
}
