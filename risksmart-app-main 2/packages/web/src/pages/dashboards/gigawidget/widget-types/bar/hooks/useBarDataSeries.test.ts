import { vi } from 'vitest';

import { useDataSeries as useUnifiedDataSeries } from '../../../hooks/useDataSeries';
import { useDataSeries } from './useBarDataSeries';

vi.mock('../../../hooks/useDataSeries');
const useUnifiedDataSeriesMock = vi.mocked(useUnifiedDataSeries);

describe('useDataSeries (Bar Chart Wrapper)', () => {
  it('calls the unified hook with correct bar chart parameters', () => {
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
        data: [{ x: 'Cat1', y: 5 }],
        type: 'bar' as const,
        title: 'Test',
        color: '#00DECB',
      },
    ];

    useUnifiedDataSeriesMock.mockReturnValue(mockResult);

    const result = useDataSeries(mockCategories, mockTranslationOptions);

    expect(useUnifiedDataSeriesMock).toHaveBeenCalledWith(
      mockCategories,
      mockTranslationOptions,
      {
        chartType: 'bar',
        enablePointColors: false,
      }
    );

    expect(result).toBe(mockResult);
  });
});
