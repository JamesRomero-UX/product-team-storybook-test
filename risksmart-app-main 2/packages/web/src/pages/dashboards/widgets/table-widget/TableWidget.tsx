import Box from '@risk-smart/themed-cloudscape-components/box';
import Table from '@risksmart-app/components/src/table';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CustomPdfFormValues } from 'src/components/custom-pdf-export-modal/CustomPdfExportModal';
import CustomPdfExportModal from 'src/components/custom-pdf-export-modal/CustomPdfExportModal';
import { useExportOptions } from 'src/hooks/useExportOptions';

import type { TablePropsWithActions, TableRecord } from '@/utils/table/types';

import styles from '../../style.module.scss';
import { useWidgetContext } from '../../widget-context/WidgetContext';

type Props<T extends TableRecord> = {
  loading?: boolean;
  tableProps: TablePropsWithActions<T>;
};

const TableWidget = <T extends TableRecord>({
  tableProps,
  loading,
}: Props<T>) => {
  const widgetData = useWidgetContext();
  const [showModal, setShowModal] = useState(false);
  const entityLabel = 'Widget Table';

  const onShowCustomPdfModal = useCallback(() => {
    setShowModal(true);
  }, []);

  const getActiveRibbonFilters = useCallback(() => [], []);

  const { exportOptions, exportToPdf } = useExportOptions<T>({
    tableProps,
    pdfTemplateId: undefined,
    entityLabel,
    getActiveRibbonFilters,
    onShowCustomPdfModal,
  });

  // Capture as ref to ensure we can grab latest export options after table has fully loaded
  // without an infinite re-render
  const exportOptionsRef = useRef(exportOptions);
  exportOptionsRef.current = exportOptions;

  const stableExportFns = useMemo(
    () =>
      exportOptions.map((option, index) => ({
        id: option.id,
        text: option.text,
        fn: () => {
          exportOptionsRef.current[index]?.exportFunction();
        },
      })),
    // The dependency array ensures this only re-runs if the IDs of the export options change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(exportOptions.map((o) => o.id))]
  );

  useEffect(() => {
    if (widgetData && !loading) {
      widgetData?.setExportFns?.(stableExportFns);
    }
  }, [loading, stableExportFns, widgetData]);

  return (
    <Box padding={{ left: 's', right: 's' }}>
      <div className={styles.stickyHeader}>
        <Table
          {...tableProps}
          loading={loading}
          variant={'borderless'}
          stickyHeader={true}
        />
      </div>
      <CustomPdfExportModal
        exportToPdf={async (options: CustomPdfFormValues) => {
          await exportToPdf({
            titleOverride: options.title,
            subtitleOverride: options.subtitle,
            hideRibbon: options.hideRibbon,
            orientation: options.orientation,
          });
        }}
        entityLabel={entityLabel}
        showModal={showModal}
        setShowModal={setShowModal}
        showRibbonOptions={true}
      />
    </Box>
  );
};

export default TableWidget;
