import i18n from 'i18next';
import { vi } from 'vitest';

import { settingsToTitle } from './settingsToTitle';

vi.mock('i18next');

const tMock = vi.mocked(i18n.t);
const formatMock = vi.mocked(i18n.format);

describe('util', () => {
  describe('settingsToTitle', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('should display the entity name when there is not category', () => {
      formatMock.mockReturnValue('Actions');
      const title = settingsToTitle({
        dataSource: 'action',
        chartType: 'bar',
        categoryGetter: '',
        showFilters: true,
        ignoreDashboardDateFilter: false,
        unit: 'Total',
      });
      expect(title).toEqual('Actions');
    });

    it('should display the "{entity} by {category}" when there is a category', () => {
      formatMock.mockReturnValueOnce('Actions');
      formatMock.mockReturnValueOnce('Action');
      formatMock.mockReturnValueOnce('Raised Date');
      tMock.mockReturnValue({} as unknown as string);
      const title = settingsToTitle({
        dataSource: 'action',
        chartType: 'bar',
        categoryGetter: 'dateRaised',
        showFilters: true,
        ignoreDashboardDateFilter: false,
        unit: 'Total',
      });
      expect(title).toEqual('Actions by Raised Date');
    });

    it('should display the "Sum of {entity} {aggregationField} by {category}" when there is a category', () => {
      formatMock.mockReturnValueOnce('Consquences');
      formatMock.mockReturnValueOnce('Consequence');
      formatMock.mockReturnValueOnce('Cost type');
      tMock.mockReturnValue({
        CostHours: 'Cost (hours)',
      } as unknown as string);
      const title = settingsToTitle({
        dataSource: 'consequence',
        chartType: 'bar',
        categoryGetter: 'costType',
        aggregationType: 'sum',
        aggregationField: 'CostHours',
        showFilters: true,
        ignoreDashboardDateFilter: false,
        unit: 'Total',
      });
      expect(title).toEqual('Sum of Consequence Cost (hours) by Cost type');
    });
  });
});
