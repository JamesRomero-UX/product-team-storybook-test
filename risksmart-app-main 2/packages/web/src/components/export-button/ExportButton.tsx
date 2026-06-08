import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ButtonDropdown from 'src/components/button-dropdown/ButtonDropdown';
import type { CustomPdfFormValues } from 'src/components/custom-pdf-export-modal/CustomPdfExportModal';
import CustomPdfExportModal from 'src/components/custom-pdf-export-modal/CustomPdfExportModal';

import type { FilterModal } from '@/components/customisable-ribbon/customisableRibbonModalSchema';
import { type ExportType, useExportOptions } from '@/hooks/useExportOptions';
import type { TablePropsWithActions, TableRecord } from '@/utils/table/types';

// PDF-related request/response types are handled within usePagePdfExport

interface RibbonExportProps<T extends TableRecord = TableRecord> {
  tableProps?: TablePropsWithActions<T>;
  defaultRibbonFilters?: FilterModal[];
  pdfTemplateId?: string;
  entityLabel?: string;
  getActiveRibbonFilters?: () => FilterModal[];
}

const ExportButton = <T extends TableRecord = TableRecord>({
  tableProps,
  defaultRibbonFilters: _defaultRibbonFilters = [],
  pdfTemplateId,
  entityLabel,
  getActiveRibbonFilters,
}: RibbonExportProps<T>) => {
  const { t } = useTranslation(['common'], { keyPrefix: 'export' });
  const [showModal, setShowModal] = useState(false);

  const { exportOptions, exportToPdf } = useExportOptions<T>({
    tableProps,
    pdfTemplateId,
    entityLabel,
    getActiveRibbonFilters,
    onShowCustomPdfModal: () => {
      setShowModal(true);
    },
  });

  const handleItemClick = (exportType: ExportType): void => {
    const option = exportOptions.find((opt) => opt.id === exportType);
    if (option && !option.disabled) {
      option.exportFunction();
    }
  };

  return (
    <>
      <ButtonDropdown
        items={exportOptions.map((option) => ({
          text: option.text,
          id: option.id,
          disabled: option.disabled,
        }))}
        onItemClick={(event) => {
          const exportType = event.detail.id as ExportType;
          handleItemClick(exportType);
        }}
        variant={'normal'}
      >
        {t('export', 'Export')}
      </ButtonDropdown>
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
    </>
  );
};

export default ExportButton;
