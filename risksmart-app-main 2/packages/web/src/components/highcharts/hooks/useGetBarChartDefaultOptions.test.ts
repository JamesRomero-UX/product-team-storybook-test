import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useGetBarChartDefaultOptions } from './useGetBarChartDefaultOptions';

describe('useGetBarChartDefaultOptions', () => {
  it('should return default bar chart options with horizontal orientation', () => {
    const { result } = renderHook(() => useGetBarChartDefaultOptions({}));

    expect(result.current.chart?.type).toBe('bar');
    expect(result.current.subtitle?.text).toBe('');
    expect((result.current.yAxis as Highcharts.YAxisOptions)?.min).toBe(0);
    expect(
      (result.current.yAxis as Highcharts.YAxisOptions)?.allowDecimals
    ).toBe(false);
    expect(result.current.legend?.enabled).toBe(false);
    expect(result.current.plotOptions?.series?.stacking).toBeUndefined();
  });

  it('should return vertical chart options when orientation is vertical', () => {
    const { result } = renderHook(() =>
      useGetBarChartDefaultOptions({ orientation: 'vertical' })
    );

    expect(result.current.chart?.type).toBe('column');
  });

  it('should return horizontal chart options when orientation is horizontal', () => {
    const { result } = renderHook(() =>
      useGetBarChartDefaultOptions({ orientation: 'horizontal' })
    );

    expect(result.current.chart?.type).toBe('bar');
  });

  it('should default to horizontal chart when orientation is not provided', () => {
    const { result } = renderHook(() => useGetBarChartDefaultOptions({}));

    expect(result.current.chart?.type).toBe('bar');
  });

  it('should include subtitle when provided', () => {
    const subtitle = 'Test Chart Subtitle';
    const { result } = renderHook(() =>
      useGetBarChartDefaultOptions({ subtitle })
    );

    expect(result.current.subtitle?.text).toBe(subtitle);
  });

  it('should include onClick handler when provided', () => {
    const onClick = vi.fn();
    const { result } = renderHook(() =>
      useGetBarChartDefaultOptions({ onClick })
    );

    expect(result.current.plotOptions?.series?.events?.click).toBe(onClick);
  });

  it('should enable stacked bars when stackedBars is true', () => {
    const { result } = renderHook(() =>
      useGetBarChartDefaultOptions({ stackedBars: true })
    );

    expect(result.current.plotOptions?.series?.stacking).toBe('normal');
  });

  it('should not enable stacked bars when stackedBars is false', () => {
    const { result } = renderHook(() =>
      useGetBarChartDefaultOptions({ stackedBars: false })
    );

    expect(result.current.plotOptions?.series?.stacking).toBeUndefined();
  });

  it('should enable legends when enableLegend is true', () => {
    const { result } = renderHook(() =>
      useGetBarChartDefaultOptions({ enableLegend: true })
    );

    expect(result.current.legend?.enabled).toBe(true);
  });

  it('should not enable legends when enableLegend is falsy', () => {
    const { result } = renderHook(() => useGetBarChartDefaultOptions({}));

    expect(result.current.legend?.enabled).toBe(false);
  });

  it('should have correct tooltip configuration', () => {
    const { result } = renderHook(() => useGetBarChartDefaultOptions({}));

    expect(result.current.tooltip?.headerFormat).toBe('<b>{category}</b><br/>');
    expect(result.current.tooltip?.pointFormat).toBe(
      '{series.name}: {point.y}'
    );
  });
});
