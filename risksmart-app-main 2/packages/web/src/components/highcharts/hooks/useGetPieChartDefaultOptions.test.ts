import { renderHook } from '@testing-library/react';
import type { SeriesPieDataLabelsOptionsObject } from 'highcharts';
import { describe, expect, it, vi } from 'vitest';

import { useGetPieChartDefaultOptions } from './useGetPieChartDefaultOptions';

describe('useGetPieChartDefaultOptions', () => {
  it('should return default pie chart options', () => {
    const { result } = renderHook(() => useGetPieChartDefaultOptions({}));

    expect(result.current.chart?.type).toBe('pie');
    expect(result.current.title?.text).toBe('');
    expect(result.current.plotOptions?.pie?.innerSize).toBe('0');
  });

  it('should return donut chart options when donut is true', () => {
    const { result } = renderHook(() =>
      useGetPieChartDefaultOptions({ donut: true })
    );

    expect(result.current.plotOptions?.pie?.innerSize).toBe('75%');
    expect(result.current.plotOptions?.pie?.center).toEqual(['50%', '50%']);
  });

  it('should display label as percentage when showAsPercentage is true', () => {
    const { result } = renderHook(() =>
      useGetPieChartDefaultOptions({ showAsPercentage: true })
    );

    expect(
      (
        result.current.plotOptions?.pie
          ?.dataLabels as SeriesPieDataLabelsOptionsObject
      ).format
    ).toBe('{point.name}<br />{point.percentage:.0f}%');
  });

  it('should display label as number when showAsPercentage is false', () => {
    const { result } = renderHook(() =>
      useGetPieChartDefaultOptions({ showAsPercentage: false })
    );

    expect(
      (
        result.current.plotOptions?.pie
          ?.dataLabels as SeriesPieDataLabelsOptionsObject
      ).format
    ).toBe('{point.name}<br />{point.y}');
  });

  it('should display label as number when showAsPercentage is undefined', () => {
    const { result } = renderHook(() => useGetPieChartDefaultOptions({}));

    expect(
      (
        result.current.plotOptions?.pie
          ?.dataLabels as SeriesPieDataLabelsOptionsObject
      ).format
    ).toBe('{point.name}<br />{point.y}');
  });

  it('should include onClick handler when provided', () => {
    const onClick = vi.fn();
    const { result } = renderHook(() =>
      useGetPieChartDefaultOptions({ onClick })
    );

    expect(result.current.plotOptions?.pie?.events?.click).toBe(onClick);
  });
});
