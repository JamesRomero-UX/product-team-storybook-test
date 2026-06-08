import { renderHook } from '@testing-library/react';
import JSZip from 'jszip';
import type { Mock } from 'vitest';
import { vi } from 'vitest';

import { useDashboardBulkExportStore } from '../useDashboardBulkExportStore';
import { useGetImageZip } from './useGetImageZip';

vi.mock('jszip', () => {
  const mockZip = {
    file: vi.fn(),
    generateAsync: vi.fn(),
  };

  return {
    default: vi.fn(() => mockZip),
  };
});

vi.mock('../useDashboardBulkExportStore');

describe('useGetImageZip', () => {
  const mockUseDashboardBulkExportStore = vi.mocked(
    useDashboardBulkExportStore
  );
  const mockJSZip = vi.mocked(JSZip);

  const mockCanvas = {
    toBlob: vi.fn(),
  } as unknown as HTMLCanvasElement;

  const mockBlob = new Blob(['test'], { type: 'image/png' });

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset JSZip mock
    const mockZipInstance = {
      file: vi.fn(),
      generateAsync: vi.fn().mockResolvedValue(mockBlob),
    };
    mockJSZip.mockReturnValue(mockZipInstance as unknown as JSZip);

    // Setup URL.createObjectURL mock
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');

    // Setup canvas.toBlob mock
    (mockCanvas.toBlob as unknown as Mock).mockImplementation(
      (callback: (blob: Blob | null) => void) => {
        callback(mockBlob);
      }
    );
  });

  it('should create zip file with widget images and trigger download', async () => {
    const mockExportFn1 = vi.fn().mockResolvedValue(mockCanvas);
    const mockExportFn2 = vi.fn().mockResolvedValue(mockCanvas);

    const mockWidgetExports = [
      { id: 'widget-1', exportFn: mockExportFn1 },
      { id: 'widget-2', exportFn: mockExportFn2 },
    ];

    mockUseDashboardBulkExportStore.mockReturnValue({
      widgetExports: mockWidgetExports,
      addWidgetExport: vi.fn(),
      removeWidgetExport: vi.fn(),
      clearWidgetExports: vi.fn(),
    });

    const { result } = renderHook(() => useGetImageZip());

    await result.current.getImageZip();

    // Verify export functions were called
    expect(mockExportFn1).toHaveBeenCalledTimes(1);
    expect(mockExportFn2).toHaveBeenCalledTimes(1);

    // Verify JSZip was created
    expect(mockJSZip).toHaveBeenCalledTimes(1);

    // Get the zip instance that was created
    const zipInstance = mockJSZip.mock.results[0].value;

    // Verify files were added to zip
    expect(zipInstance.file).toHaveBeenCalledWith('widget-1.png', mockBlob);
    expect(zipInstance.file).toHaveBeenCalledWith('widget-2.png', mockBlob);

    // Verify zip was generated
    expect(zipInstance.generateAsync).toHaveBeenCalledWith({ type: 'blob' });

    // Verify download was triggered
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
  });

  it('should handle empty widget exports', async () => {
    mockUseDashboardBulkExportStore.mockReturnValue({
      widgetExports: [],
      addWidgetExport: vi.fn(),
      removeWidgetExport: vi.fn(),
      clearWidgetExports: vi.fn(),
    });

    const { result } = renderHook(() => useGetImageZip());

    await result.current.getImageZip();

    // Verify JSZip was still created
    expect(mockJSZip).toHaveBeenCalledTimes(1);

    const zipInstance = mockJSZip.mock.results[0].value;

    // Verify no files were added to zip
    expect(zipInstance.file).not.toHaveBeenCalled();

    // Verify zip was still generated and download triggered
    expect(zipInstance.generateAsync).toHaveBeenCalledWith({ type: 'blob' });
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
  });

  it('should skip widget export if exportFn returns undefined', async () => {
    const mockExportFn1 = vi.fn().mockResolvedValue(mockCanvas);
    const mockExportFn2 = vi.fn().mockResolvedValue(undefined);

    const mockWidgetExports = [
      { id: 'widget-1', exportFn: mockExportFn1 },
      { id: 'widget-2', exportFn: mockExportFn2 },
    ];

    mockUseDashboardBulkExportStore.mockReturnValue({
      widgetExports: mockWidgetExports,
      addWidgetExport: vi.fn(),
      removeWidgetExport: vi.fn(),
      clearWidgetExports: vi.fn(),
    });

    const { result } = renderHook(() => useGetImageZip());

    await result.current.getImageZip();

    // Verify export function was called
    expect(mockExportFn1).toHaveBeenCalledTimes(1);
    expect(mockExportFn2).toHaveBeenCalledTimes(1);

    // Verify JSZip was created but no further processing occurred
    expect(mockJSZip).toHaveBeenCalledTimes(1);

    const zipInstance = mockJSZip.mock.results[0].value;

    // Verify zip file addition was only called for the first widget
    expect(zipInstance.file).toHaveBeenCalledTimes(1);
  });

  it('should handle canvas.toBlob returning null', async () => {
    const mockCanvasWithNullBlob = {
      toBlob: vi
        .fn()
        .mockImplementation((callback: (blob: Blob | null) => void) => {
          callback(null);
        }),
    } as unknown as HTMLCanvasElement;

    const mockExportFn = vi.fn().mockResolvedValue(mockCanvasWithNullBlob);

    const mockWidgetExports = [{ id: 'widget-1', exportFn: mockExportFn }];

    mockUseDashboardBulkExportStore.mockReturnValue({
      widgetExports: mockWidgetExports,
      addWidgetExport: vi.fn(),
      removeWidgetExport: vi.fn(),
      clearWidgetExports: vi.fn(),
    });

    const { result } = renderHook(() => useGetImageZip());

    await result.current.getImageZip();

    // Verify export function was called
    expect(mockExportFn).toHaveBeenCalledTimes(1);

    const zipInstance = mockJSZip.mock.results[0].value;

    // Verify file was not added to zip since blob was null
    expect(zipInstance.file).not.toHaveBeenCalled();

    // But zip should still be generated and downloaded
    expect(zipInstance.generateAsync).toHaveBeenCalledWith({ type: 'blob' });
    expect(global.URL.createObjectURL).toHaveBeenCalledTimes(1);
  });
});
