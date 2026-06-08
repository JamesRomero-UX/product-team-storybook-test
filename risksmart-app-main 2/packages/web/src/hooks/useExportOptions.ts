import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { FilterModal } from '@/components/customisable-ribbon/customisableRibbonModalSchema';
import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { usePagePdfExport } from '@/hooks/usePagePdfExport';
import type {
  TableFields,
  TablePropsWithActions,
  TableRecord,
} from '@/utils/table/types';

export type ExportType = 'csv' | 'pdf' | 'custom-pdf';

export interface ExportOption {
  id: ExportType;
  text: string;
  disabled: boolean;
  exportFunction: () => void;
}

export interface UseExportOptionsReturn {
  exportOptions: ExportOption[];
  exportToPdf: (overrides?: {
    titleOverride?: string;
    subtitleOverride?: string;
    hideRibbon?: boolean;
    orientation?: 'landscape' | 'portrait';
  }) => Promise<void>;
  hasPdfCapability: boolean;
}

interface UseExportOptionsProps<T extends TableRecord = TableRecord> {
  tableProps?: TablePropsWithActions<T>;
  pdfTemplateId?: string;
  entityLabel?: string;
  getActiveRibbonFilters?: () => FilterModal[];
  onShowCustomPdfModal?: () => void;
}

export const useExportOptions = <T extends TableRecord = TableRecord>({
  tableProps,
  pdfTemplateId,
  entityLabel,
  getActiveRibbonFilters,
  onShowCustomPdfModal,
}: UseExportOptionsProps<T>): UseExportOptionsReturn => {
  const { t } = useTranslation(['common'], { keyPrefix: 'export' });

  // Determine if this page integrates with CustomisableRibbon (signals ribbon should appear in PDF)
  const hasRibbonIntegration = Boolean(getActiveRibbonFilters);
  // Use provided getters when integrated; otherwise leave undefined so PDF omits ribbon
  const currentRibbonFilters = hasRibbonIntegration
    ? getActiveRibbonFilters?.()
    : undefined;

  // Only setup PDF export if required props are provided
  const hasPdfCapability = !!(tableProps && tableProps.fields && entityLabel);
  // Feature flag: pdf export gated for initial rollout
  const pdfExportEnabled = useIsFeatureFlagEnabled('pdf_export');

  // Provide a fallback when PDF capability is not available
  const fallbackTableProps = useMemo(
    () => ({
      allItems: [] as T[],
      filteringProperties: [],
      propertyFilterQuery: { tokens: [], operation: 'and' as const },
      fields: {} as TableFields<T>,
      entityLabel: '',
    }),
    []
  );

  // Compute effective inputs for PDF export
  const effectiveTableProps = (hasPdfCapability
    ? tableProps
    : fallbackTableProps) as unknown as TablePropsWithActions<T>;
  const effectiveFields =
    (tableProps?.fields as TableFields<T>) || ({} as TableFields<T>);
  const effectiveTemplateId = pdfTemplateId;
  const effectiveEntityLabel = hasPdfCapability ? (entityLabel as string) : '';

  // Use the consolidated PDF export hook (passes fallbacks when disabled)
  const { exportToPdf } = usePagePdfExport<T>({
    tableProps: effectiveTableProps,
    fields: effectiveFields,
    ribbonFilters: currentRibbonFilters,
    pdfTemplateId: effectiveTemplateId,
    entityLabel: effectiveEntityLabel,
  });

  const exportToCsvHandler = tableProps?.exportToCsv;

  const exportOptions = useMemo(() => {
    const options: ExportOption[] = [
      {
        id: 'csv',
        text: t('download_csv', 'Download CSV') as string,
        disabled: !exportToCsvHandler,
        exportFunction: () => {
          exportToCsvHandler?.();
        },
      },
    ];

    // Only include PDF options when feature flag is enabled
    if (pdfExportEnabled) {
      options.push(
        {
          id: 'pdf',
          text: t('download_pdf', 'Download PDF') as string,
          disabled: !hasPdfCapability,
          exportFunction: () => {
            if (hasPdfCapability && pdfExportEnabled) {
              exportToPdf();
            }
          },
        },
        {
          id: 'custom-pdf',
          text: t('download_custom_pdf', 'Custom PDF') as string,
          disabled: !hasPdfCapability,
          exportFunction: () => {
            if (hasPdfCapability && pdfExportEnabled) {
              onShowCustomPdfModal?.();
            }
          },
        }
      );
    }

    return options;
  }, [
    t,
    exportToCsvHandler,
    pdfExportEnabled,
    hasPdfCapability,
    exportToPdf,
    onShowCustomPdfModal,
  ]);

  return {
    exportOptions,
    exportToPdf,
    hasPdfCapability,
  };
};
