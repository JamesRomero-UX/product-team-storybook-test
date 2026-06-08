import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useDashboardBulkExportStore } from './useDashboardBulkExportStore';

describe('useDashboardBulkExportStore', () => {
  it('should set widgetExports', () => {
    const { result } = renderHook(() => useDashboardBulkExportStore());

    act(() => {
      result.current.addWidgetExport({ id: 'widget-1', exportFn: vi.fn() });
    });

    expect(result.current.widgetExports).toHaveLength(1);
    expect(result.current.widgetExports[0].id).toBe('widget-1');
  });

  it('should update widgetExport if same id is added', () => {
    const mockExportFn1 = vi.fn();
    const mockExportFn2 = vi.fn();

    const { result } = renderHook(() => useDashboardBulkExportStore());

    act(() => {
      result.current.addWidgetExport({
        id: 'widget-1',
        exportFn: mockExportFn1,
      });
    });

    expect(result.current.widgetExports).toHaveLength(1);
    expect(result.current.widgetExports[0].exportFn).toBe(mockExportFn1);

    act(() => {
      result.current.addWidgetExport({
        id: 'widget-1',
        exportFn: mockExportFn2,
      });
    });

    expect(result.current.widgetExports).toHaveLength(1);
    expect(result.current.widgetExports[0].exportFn).toBe(mockExportFn2);
  });

  it('should remove widgetExport by id', () => {
    const { result } = renderHook(() => useDashboardBulkExportStore());

    act(() => {
      result.current.addWidgetExport({ id: 'widget-1', exportFn: vi.fn() });
      result.current.addWidgetExport({ id: 'widget-2', exportFn: vi.fn() });
    });

    expect(result.current.widgetExports).toHaveLength(2);

    act(() => {
      result.current.removeWidgetExport('widget-1');
    });

    expect(result.current.widgetExports).toHaveLength(1);
    expect(result.current.widgetExports[0].id).toBe('widget-2');
  });

  it('should clear all widgetExports', () => {
    const { result } = renderHook(() => useDashboardBulkExportStore());

    act(() => {
      result.current.addWidgetExport({ id: 'widget-1', exportFn: vi.fn() });
      result.current.addWidgetExport({ id: 'widget-2', exportFn: vi.fn() });
    });

    expect(result.current.widgetExports).toHaveLength(2);

    act(() => {
      result.current.clearWidgetExports();
    });

    expect(result.current.widgetExports).toHaveLength(0);
  });
});
