import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useGetRadarChartDefaultOptions } from './useGetRadarChartDefaultOptions';

describe('useGetRadarChartDefaultOptions', () => {
  it('should return default radar chart options', () => {
    const { result } = renderHook(() => useGetRadarChartDefaultOptions({}));

    expect(result.current.chart?.polar).toBe(true);
    expect(result.current.subtitle?.text).toBe('');
    expect(
      (result.current.xAxis as Highcharts.XAxisOptions)?.tickmarkPlacement
    ).toBe('between');
    expect((result.current.xAxis as Highcharts.XAxisOptions)?.lineWidth).toBe(
      0
    );
    expect(
      (result.current.yAxis as Highcharts.YAxisOptions)?.gridLineInterpolation
    ).toBe('circle');
    expect((result.current.yAxis as Highcharts.YAxisOptions)?.lineWidth).toBe(
      0
    );
    expect((result.current.yAxis as Highcharts.YAxisOptions)?.min).toBe(0);
    expect(
      (result.current.yAxis as Highcharts.YAxisOptions)?.allowDecimals
    ).toBe(false);
    expect((result.current.yAxis as Highcharts.YAxisOptions)?.endOnTick).toBe(
      false
    );
    expect(result.current.legend?.enabled).toBe(false);
  });

  it('should include subtitle when provided', () => {
    const subtitle = 'Test Radar Chart Subtitle';
    const { result } = renderHook(() =>
      useGetRadarChartDefaultOptions({ subtitle })
    );

    expect(result.current.subtitle?.text).toBe(subtitle);
  });

  it('should include onClick handler when provided', () => {
    const onClick = vi.fn();
    const { result } = renderHook(() =>
      useGetRadarChartDefaultOptions({ onClick })
    );

    expect(result.current.plotOptions?.series?.events?.click).toBe(onClick);
  });

  it('should enable legend when enableLegend is true', () => {
    const { result } = renderHook(() =>
      useGetRadarChartDefaultOptions({ enableLegend: true })
    );

    expect(result.current.legend?.enabled).toBe(true);
  });

  it('should not enable legend when enableLegend is false', () => {
    const { result } = renderHook(() =>
      useGetRadarChartDefaultOptions({ enableLegend: false })
    );

    expect(result.current.legend?.enabled).toBe(false);
  });

  it('should not enable legend when enableLegend is undefined', () => {
    const { result } = renderHook(() => useGetRadarChartDefaultOptions({}));

    expect(result.current.legend?.enabled).toBe(false);
  });

  it('should have correct tooltip configuration', () => {
    const { result } = renderHook(() => useGetRadarChartDefaultOptions({}));

    expect(result.current.tooltip?.shared).toBe(true);
    expect(result.current.tooltip?.pointFormat).toBe(
      '{series.name}: {point.y}<br/>'
    );
    expect(result.current.tooltip?.headerFormat).toBe('<b>{category}</b><br/>');
  });

  it('should have correct column plot options', () => {
    const { result } = renderHook(() => useGetRadarChartDefaultOptions({}));

    expect(result.current.plotOptions?.column?.pointPadding).toBe(0);
    expect(result.current.plotOptions?.column?.groupPadding).toBe(0);
  });
});
