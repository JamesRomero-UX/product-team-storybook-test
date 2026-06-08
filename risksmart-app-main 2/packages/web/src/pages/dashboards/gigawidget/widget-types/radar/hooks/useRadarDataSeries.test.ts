import { vi } from 'vitest';

import { useDataSeries as useUnifiedDataSeries } from '../../../hooks/useDataSeries';
import { useRadarDataSeries } from './useRadarDataSeries';

vi.mock('../../../hooks/useDataSeries');
const useUnifiedDataSeriesMock = vi.mocked(useUnifiedDataSeries);

describe('useRadarDataSeries (Radar Chart Wrapper)', () => {
  it('calls the unified hook with correct radar chart parameters', () => {
    const mockCategories = [
      {
        key: 'Cat1',
        label: 'Cat1',
        aggregatedValue: 5,
        data: [],
      },
    ];

    const mockTranslationOptions = {
      entityNamePlural: 'risk_other' as const,
    };

    const mockResult = [
      {
        data: [{ x: 'Cat1', y: 5, color: '#00DECB' }],
        type: 'column' as const,
        title: 'Test',
        color: '#00DECB',
      },
    ];

    useUnifiedDataSeriesMock.mockReturnValue(mockResult);

    const result = useRadarDataSeries(mockCategories, mockTranslationOptions);

    expect(useUnifiedDataSeriesMock).toHaveBeenCalledWith(
      mockCategories,
      mockTranslationOptions,
      {
        chartType: 'column',
        enablePointColors: true,
      }
    );

    expect(result).toBe(mockResult);
  });
});
