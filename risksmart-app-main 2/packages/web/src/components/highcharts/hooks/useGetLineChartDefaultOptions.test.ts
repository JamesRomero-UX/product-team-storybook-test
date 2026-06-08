import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useGetLineChartDefaultOptions } from './useGetLineChartDefaultOptions';

describe('useGetLineChartDefaultOptions', () => {
  it('should return default line chart options', () => {
    const { result } = renderHook(() => useGetLineChartDefaultOptions({}));

    expect(result.current.chart?.type).toBe('line');
    expect(result.current.subtitle?.text).toBe('');
    expect((result.current.yAxis as Highcharts.YAxisOptions)?.min).toBe(0);
    expect(
      (result.current.yAxis as Highcharts.YAxisOptions)?.allowDecimals
    ).toBe(false);
    expect(result.current.legend?.enabled).toBe(false);
  });

  it('should include subtitle when provided', () => {
    const subtitle = 'Test Chart Subtitle';
    const { result } = renderHook(() =>
      useGetLineChartDefaultOptions({ subtitle })
    );

    expect(result.current.subtitle?.text).toBe(subtitle);
  });

  it('should include onClick handler when provided', () => {
    const onClick = vi.fn();
    const { result } = renderHook(() =>
      useGetLineChartDefaultOptions({ onClick })
    );

    expect(result.current.plotOptions?.series?.events?.click).toBe(onClick);
  });

  it('should have correct tooltip configuration', () => {
    const { result } = renderHook(() => useGetLineChartDefaultOptions({}));

    expect(result.current.tooltip?.headerFormat).toBe('<b>{category}</b><br/>');
    expect(result.current.tooltip?.pointFormat).toBe(
      '{series.name}: {point.y}'
    );
  });
});
