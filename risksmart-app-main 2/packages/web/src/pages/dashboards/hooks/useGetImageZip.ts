import JSZip from 'jszip';

import { useDashboardBulkExportStore } from '../useDashboardBulkExportStore';

/**
 * @returns Function to generate and download a zip file of all widget images
 */
export const useGetImageZip = () => {
  const { widgetExports } = useDashboardBulkExportStore();

  const getImageZip = async () => {
    const zip = new JSZip();

    for (const we of widgetExports) {
      const canvas = await we.exportFn();
      if (canvas === undefined) {
        continue;
      }
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve)
      );
      if (blob) {
        zip.file(`${we.id}.png`, blob);
      }
    }

    const fullZip = await zip.generateAsync({ type: 'blob' });

    // Download the zip file
    const link = document.createElement('a');
    link.href = URL.createObjectURL(fullZip);
    link.download = `dashboard_images.zip`;
    link.click();
  };

  return { getImageZip };
};
