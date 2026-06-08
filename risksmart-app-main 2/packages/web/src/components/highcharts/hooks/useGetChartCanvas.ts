import type { Chart } from 'highcharts';

/**
 * Get chart canvas from Highcharts chart instance
 * @returns Hook to generate svg canvas from chart
 */
export const useGetChartCanvas = () => {
  return (chart: Chart): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, reject) => {
      try {
        // Create a canvas element to render the SVG
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Create an image element to load the SVG data
        const img = new Image();
        const svgBlob = new Blob(
          [chart.exporting.getSVG(chart.options.exporting?.chartOptions)],
          {
            type: 'image/svg+xml;charset=utf-8',
          }
        );
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
          // Set canvas dimensions to match the image
          canvas.width = img.width || chart.chartWidth || 800;
          canvas.height = img.height || chart.chartHeight || 600;

          if (!ctx) {
            URL.revokeObjectURL(url);
            reject('Unable to get canvas context');

            return;
          }

          // Draw the SVG image onto the canvas
          ctx.drawImage(img, 0, 0);

          URL.revokeObjectURL(url);

          resolve(canvas);
        };

        img.onerror = (error) => {
          URL.revokeObjectURL(url);
          reject(error);
        };

        img.src = url;
      } catch (error) {
        reject(error);
      }
    });
  };
};
