import type { Chart } from 'highcharts';
import { vi } from 'vitest';

import { useGetChartCanvas } from './useGetChartCanvas';

// Mock global objects
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: vi.fn(),
};

const mockContext = {
  drawImage: vi.fn(),
};

const mockImage = {
  width: 800,
  height: 600,
  onload: null as (() => void) | null,
  onerror: null as ((error: unknown) => void) | null,
  src: '',
};

const mockChart = {
  chartWidth: 800,
  chartHeight: 600,
  exporting: {
    getSVG: vi.fn(),
  },
} as unknown as Chart;

// Mock DOM APIs
global.document = {
  createElement: vi.fn(),
} as unknown as Document;

global.Image = vi.fn().mockImplementation(() => mockImage);

global.Blob = vi.fn().mockImplementation((parts, options) => ({
  type: options?.type || 'text/plain',
})) as unknown as typeof Blob;

global.URL = {
  createObjectURL: vi.fn().mockReturnValue('blob:mock-url'),
  revokeObjectURL: vi.fn(),
} as unknown as typeof URL;

describe('useGetChartCanvas', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock implementations
    mockCanvas.getContext = vi.fn().mockReturnValue(mockContext);
    (global.document.createElement as ReturnType<typeof vi.fn>).mockReturnValue(
      mockCanvas
    );

    mockChart.exporting.getSVG = vi.fn().mockReturnValue('<svg>mock svg</svg>');
    mockChart.options = {};

    // Reset image dimensions
    mockImage.width = 800;
    mockImage.height = 600;
    mockImage.onload = null;
    mockImage.onerror = null;
    mockImage.src = '';

    // Reset context methods
    mockContext.drawImage = vi.fn();
  });

  it('should successfully convert chart SVG to canvas', async () => {
    const getChartCanvas = useGetChartCanvas();

    // Start the conversion
    const canvasPromise = getChartCanvas(mockChart);

    // Simulate successful image load
    expect(mockImage.onload).toBeDefined();
    if (mockImage.onload) {
      mockImage.onload();
    }

    const canvas = await canvasPromise;

    expect(canvas).toBe(mockCanvas);
    expect(global.document.createElement).toHaveBeenCalledWith('canvas');
    expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
    expect(mockChart.exporting.getSVG).toHaveBeenCalled();
    expect(global.Blob).toHaveBeenCalledWith(['<svg>mock svg</svg>'], {
      type: 'image/svg+xml;charset=utf-8',
    });
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(mockContext.drawImage).toHaveBeenCalledWith(mockImage, 0, 0);
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('should set canvas dimensions from image dimensions', async () => {
    mockImage.width = 1024;
    mockImage.height = 768;

    const getChartCanvas = useGetChartCanvas();

    const canvasPromise = getChartCanvas(mockChart);

    // Simulate successful image load
    if (mockImage.onload) {
      mockImage.onload();
    }

    await canvasPromise;

    expect(mockCanvas.width).toBe(1024);
    expect(mockCanvas.height).toBe(768);
  });

  it('should fallback to chart dimensions when image dimensions are not available', async () => {
    mockImage.width = 0;
    mockImage.height = 0;

    const getChartCanvas = useGetChartCanvas();

    const canvasPromise = getChartCanvas(mockChart);

    // Simulate successful image load
    if (mockImage.onload) {
      mockImage.onload();
    }

    await canvasPromise;

    expect(mockCanvas.width).toBe(800); // Chart width
    expect(mockCanvas.height).toBe(600); // Chart height
  });

  it('should fallback to default dimensions when both image and chart dimensions are not available', async () => {
    mockImage.width = 0;
    mockImage.height = 0;

    const chartWithoutDimensions = {
      ...mockChart,
      chartWidth: undefined,
      chartHeight: undefined,
    } as unknown as Chart;

    const getChartCanvas = useGetChartCanvas();

    const canvasPromise = getChartCanvas(chartWithoutDimensions);

    // Simulate successful image load
    if (mockImage.onload) {
      mockImage.onload();
    }

    await canvasPromise;

    expect(mockCanvas.width).toBe(800); // Default width
    expect(mockCanvas.height).toBe(600); // Default height
  });

  it('should reject promise when canvas context is not available', async () => {
    mockCanvas.getContext = vi.fn().mockReturnValue(null);

    const getChartCanvas = useGetChartCanvas();

    const canvasPromise = getChartCanvas(mockChart);

    // Simulate successful image load
    if (mockImage.onload) {
      mockImage.onload();
    }

    await expect(canvasPromise).rejects.toBe('Unable to get canvas context');
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('should reject promise when image fails to load', async () => {
    const mockError = new Error('Failed to load image');

    const getChartCanvas = useGetChartCanvas();

    const canvasPromise = getChartCanvas(mockChart);

    // Simulate image error
    expect(mockImage.onerror).toBeDefined();
    if (mockImage.onerror) {
      mockImage.onerror(mockError);
    }

    await expect(canvasPromise).rejects.toBe(mockError);
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('should reject promise when SVG conversion throws error', async () => {
    const mockError = new Error('SVG conversion failed');
    mockChart.exporting.getSVG = vi.fn().mockImplementation(() => {
      throw mockError;
    });

    const getChartCanvas = useGetChartCanvas();

    await expect(getChartCanvas(mockChart)).rejects.toBe(mockError);
  });

  it('should clean up object URL on successful conversion', async () => {
    const getChartCanvas = useGetChartCanvas();

    const canvasPromise = getChartCanvas(mockChart);

    // Simulate successful image load
    if (mockImage.onload) {
      mockImage.onload();
    }

    await canvasPromise;

    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('should clean up object URL on image load error', async () => {
    const mockError = new Error('Load failed');

    const getChartCanvas = useGetChartCanvas();

    const canvasPromise = getChartCanvas(mockChart);

    // Simulate image error
    if (mockImage.onerror) {
      mockImage.onerror(mockError);
    }

    await expect(canvasPromise).rejects.toBe(mockError);
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('should create SVG blob with correct MIME type', async () => {
    const mockSVG = '<svg width="100" height="100"><circle r="50"/></svg>';
    mockChart.exporting.getSVG = vi.fn().mockReturnValue(mockSVG);

    const getChartCanvas = useGetChartCanvas();

    const canvasPromise = getChartCanvas(mockChart);

    // Simulate successful image load
    if (mockImage.onload) {
      mockImage.onload();
    }

    await canvasPromise;

    expect(global.Blob).toHaveBeenCalledWith([mockSVG], {
      type: 'image/svg+xml;charset=utf-8',
    });
  });

  it('should set image src to the created object URL', async () => {
    const mockObjectURL = 'blob:mock-custom-url';
    (global.URL.createObjectURL as ReturnType<typeof vi.fn>).mockReturnValue(
      mockObjectURL
    );

    const getChartCanvas = useGetChartCanvas();

    getChartCanvas(mockChart);

    expect(mockImage.src).toBe(mockObjectURL);
  });
});
