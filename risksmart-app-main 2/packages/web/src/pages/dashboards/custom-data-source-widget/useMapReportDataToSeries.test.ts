import type { GroupByDatePrecision } from '@risksmart-app/shared/reporting/api/schema';
import type { FieldDefinition } from '@risksmart-app/shared/reporting/datasets/types';
import { renderHook, waitFor } from '@testing-library/react';
import { useColourPalette } from 'src/hooks/useColourPalette';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import type { Options } from './useMapReportDataToSeries';
import { useMapReportDataToSeries } from './useMapReportDataToSeries';

vi.mock('@/hooks/useColourPalette');
const useColourPaletteMock = vi.mocked(useColourPalette);

describe('useMapReportDataToSeries', () => {
  const defaultOptions: Options = {
    aggregationType: null,
    reportingData: [],
    x1FieldDefinition: null,
    x2FieldDefinition: null,
    x1GroupByDatePrecision: null,
    x2GroupByDatePrecision: null,
    aggregateFieldDefinition: null,
  };

  beforeAll(() => {
    useColourPaletteMock.mockReturnValue({
      loading: false,
      error: undefined,
      refetch: vi.fn(),
      colours: ['#00DECB', '#c33d69', '#688ae8'],
      paletteId: 'test-palette-id',
      genericCategoricalPalette: (index: number) => {
        const colors = ['#00DECB', '#c33d69', '#688ae8'];

        return colors[index % colors.length];
      },
    });
  });

  it('returns an empty array when there is no reporting data', async () => {
    const xFieldDefinition: FieldDefinition = {
      defaultLabel: '',
      dataType: 'number',
      displayType: 'number',
    };
    const { result } = renderHook(
      () =>
        useMapReportDataToSeries({
          ...defaultOptions,
          x1FieldDefinition: xFieldDefinition,
        }),
      {
        wrapper: getWrapper(
          [mockedGetOrganisationModuleResponse(), mockedGetOrganisation()],
          'features',
          'graphql'
        ),
      }
    );
    await waitFor(async () => {
      expect(result.current).toEqual([{ data: [], title: '' }]);
    });
  });

  it('returns labels for commonLookup data', async () => {
    const xFieldDefinition: FieldDefinition = {
      defaultLabel: '',
      dataType: 'number',
      displayType: 'commonLookup',
      i18nKey: 'tiers',
    };
    const { result } = renderHook(
      () =>
        useMapReportDataToSeries({
          ...defaultOptions,
          reportingData: [
            [{ value: 1 }, { value: 3 }],
            [{ value: 2 }, { value: 4 }],
          ],
          x1FieldDefinition: xFieldDefinition,
        }),
      {
        wrapper: getWrapper(
          [mockedGetOrganisationModuleResponse(), mockedGetOrganisation()],
          'features',
          'graphql'
        ),
      }
    );
    await waitFor(() => {
      expect(result.current).toEqual([
        {
          data: [
            { x: 1, y: 3, label: 'Tier 1' },
            { x: 2, y: 4, label: 'Tier 2' },
          ],
          title: '',
        },
      ]);
    });
  });

  it('returns the first entry if there is no xField (single value chart e.g. kpi)', async () => {
    const { result } = renderHook(
      () =>
        useMapReportDataToSeries({
          ...defaultOptions,
          reportingData: [
            [{ value: 1 }, { value: 3 }],
            [{ value: 2 }, { value: 4 }],
          ],
        }),
      {
        wrapper: getWrapper(
          [mockedGetOrganisationModuleResponse(), mockedGetOrganisation()],
          'features',
          'graphql'
        ),
      }
    );
    await waitFor(() => {
      expect(result.current).toEqual([
        { data: [{ label: '1', x: null, y: 1 }], title: '' },
      ]);
    });
  });

  it.each([
    { data: [{ value: '1' }], expectedValue: '1' },
    { data: [{ value: '5.5' }], expectedValue: '5.5' },
    { data: [{ value: '3.73' }], expectedValue: '3.73' },
    { data: [{ value: '9.454353453' }], expectedValue: '9.45' },
    { data: [{ value: '9.459' }], expectedValue: '9.46' },
  ])(
    'returns the correct number of decimal places for kpi data',
    async ({ data, expectedValue }) => {
      const { result } = renderHook(
        () =>
          useMapReportDataToSeries({
            ...defaultOptions,
            reportingData: [data],
          }),
        {
          wrapper: getWrapper(
            [mockedGetOrganisationModuleResponse(), mockedGetOrganisation()],
            'features',
            'graphql'
          ),
        }
      );
      await waitFor(() => {
        expect(result.current).toEqual([
          {
            data: [{ label: expectedValue, x: null, y: data[0].value }],
            title: '',
          },
        ]);
      });
    }
  );

  it('returns label and colours for rating data', async () => {
    const xFieldDefinition: FieldDefinition = {
      defaultLabel: '',
      dataType: 'number',
      displayType: 'rating',
      ratingKey: 'likelihood',
    };
    const { result } = renderHook(
      () =>
        useMapReportDataToSeries({
          ...defaultOptions,
          reportingData: [
            [{ value: 1 }, { value: 3 }],
            [{ value: 2 }, { value: 4 }],
          ],
          x1FieldDefinition: xFieldDefinition,
        }),
      {
        wrapper: getWrapper(
          [mockedGetOrganisationModuleResponse(), mockedGetOrganisation()],
          'features',
          'graphql'
        ),
      }
    );
    await waitFor(() => {
      expect(result.current).toEqual([
        {
          title: '',
          data: [
            {
              x: 1,
              y: 3,
              color: '#6DAC3F',
              label: 'Very Unlikely',
            },
            {
              x: 2,
              y: 4,
              color: '#8CC862',
              label: 'Unlikely',
            },
          ],
        },
      ]);
    });
  });

  it('maps first entry to x, and second entry to y', async () => {
    const xFieldDefinition: FieldDefinition = {
      defaultLabel: '',
      dataType: 'number',
      displayType: 'number',
    };
    const { result } = renderHook(
      () =>
        useMapReportDataToSeries({
          ...defaultOptions,
          reportingData: [
            [{ value: 1 }, { value: 2 }],
            [{ value: 3 }, { value: 4 }],
          ],
          x1FieldDefinition: xFieldDefinition,
        }),
      {
        wrapper: getWrapper(
          [mockedGetOrganisationModuleResponse(), mockedGetOrganisation()],
          'features',
          'graphql'
        ),
      }
    );
    await waitFor(() => {
      expect(result.current).toEqual([
        {
          title: '',
          data: [
            { x: 1, label: '1', y: 2 },
            { x: 3, label: '3', y: 4 },
          ],
        },
      ]);
    });
  });

  it('Sets appropriate labels when displayType is date', async () => {
    const xFieldDefinition: FieldDefinition = {
      defaultLabel: '',
      dataType: 'date',
      displayType: 'date',
    };
    const { result } = renderHook(
      () =>
        useMapReportDataToSeries({
          ...defaultOptions,
          reportingData: [
            [{ value: '2000-10-31T01:30:00.000-05:00' }, { value: 1 }],
            [{ value: '2001-04-31T05:30:00.000-05:00' }, { value: 2 }],
          ],
          x1FieldDefinition: xFieldDefinition,
        }),
      {
        wrapper: getWrapper(
          [mockedGetOrganisationModuleResponse(), mockedGetOrganisation()],
          'features',
          'graphql'
        ),
      }
    );
    await waitFor(() => {
      expect(result.current).toEqual([
        {
          title: '',
          data: [
            {
              label: '31 Oct',
              x: '2000-10-31T01:30:00.000-05:00',
              y: 1,
            },
            {
              label: '01 May',
              x: '2001-04-31T05:30:00.000-05:00',
              y: 2,
            },
          ],
        },
      ]);
    });
  });

  it.each<{
    expectedLabel: string;
    x1GroupByDatePrecision: GroupByDatePrecision;
  }>([
    { x1GroupByDatePrecision: 'day', expectedLabel: '31 Oct' },
    { x1GroupByDatePrecision: 'month', expectedLabel: 'Oct 2000' },
    { x1GroupByDatePrecision: 'year', expectedLabel: '2000' },
  ])(
    'changes date label $expectedLabel based on precision ($x1GroupByDatePrecision)',
    async ({ x1GroupByDatePrecision, expectedLabel }) => {
      const xFieldDefinition: FieldDefinition = {
        defaultLabel: '',
        dataType: 'date',
        displayType: 'date',
      };
      const { result } = renderHook(
        () =>
          useMapReportDataToSeries({
            ...defaultOptions,
            reportingData: [
              [{ value: '2000-10-31T01:30:00.000-05:00' }, { value: 1 }],
            ],
            x1FieldDefinition: xFieldDefinition,
            x1GroupByDatePrecision,
          }),
        {
          wrapper: getWrapper(
            [mockedGetOrganisationModuleResponse(), mockedGetOrganisation()],
            'features',
            'graphql'
          ),
        }
      );
      await waitFor(() => {
        expect(result.current).toEqual([
          {
            title: '',
            data: [
              {
                label: expectedLabel,
                x: '2000-10-31T01:30:00.000-05:00',
                y: 1,
              },
            ],
          },
        ]);
      });
    }
  );

  describe('sub grouping', () => {
    it('returns labels for commonLookup data, with x set as the label', async () => {
      const x1FieldDefinition: FieldDefinition = {
        defaultLabel: '',
        dataType: 'number',
        displayType: 'number',
      };
      const x2FieldDefinition: FieldDefinition = {
        defaultLabel: '',
        dataType: 'number',
        displayType: 'number',
      };
      const { result } = renderHook(
        () =>
          useMapReportDataToSeries({
            ...defaultOptions,
            reportingData: [
              [{ value: 1 }, { value: 7 }, { value: 9 }],
              [{ value: 1 }, { value: 8 }, { value: 3 }],
              [{ value: 2 }, { value: 7 }, { value: 6 }],
            ],
            x1FieldDefinition,
            x2FieldDefinition,
          }),
        {
          wrapper: getWrapper(
            [mockedGetOrganisationModuleResponse(), mockedGetOrganisation()],
            'features',
            'graphql'
          ),
        }
      );
      await waitFor(() => {
        expect(result.current).toEqual([
          {
            color: '#00DECB',
            title: '7',
            hasSubcategory: true,
            data: [
              { x: 1, label: '1', y: 9 },
              { x: 2, label: '2', y: 6 },
            ],
          },
          {
            color: '#c33d69',
            title: '8',
            hasSubcategory: true,
            data: [{ x: 1, label: '1', y: 3 }],
          },
        ]);
      });
    });
  });
});
