import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { useColourPalette } from '@/hooks/useColourPalette';

import { defaultMocks } from '../../../../testing/mock-data';
import { getWrapper } from '../../../../testing/wrapper';
import { useDataSeries } from './useDataSeries';

vi.mock('@/hooks/useColourPalette');
const useColourPaletteMock = vi.mocked(useColourPalette);

describe('useDataSeries', () => {
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

  it('returns an empty array when there are no categories', async () => {
    const { result } = renderHook(
      () =>
        useDataSeries(
          [],
          {
            entityNamePlural: 'risk_other',
          },
          {
            chartType: 'bar',
            enablePointColors: false,
          }
        ),
      {
        wrapper: getWrapper(defaultMocks, 'graphql', 'features'),
      }
    );

    await waitFor(() => {
      expect(result.current).toEqual([]);
    });
  });

  it('returns a single category', async () => {
    const { result } = renderHook(
      () =>
        useDataSeries(
          [
            {
              key: 'Cat1',
              label: 'Cat1',
              aggregatedValue: 0,
              data: [],
            },
          ],
          {
            entityNamePlural: 'risk_other',
          },
          {
            chartType: 'bar',
            enablePointColors: false,
          }
        ),
      {
        wrapper: getWrapper(defaultMocks, 'graphql', 'features'),
      }
    );

    await waitFor(() => {
      expect(result.current).toEqual([
        {
          data: [{ subCategories: undefined, x: 'Cat1', y: 0 }],
          type: 'bar',
          title: 'Risks',
          color: '#00DECB',
        },
      ]);
    });
  });

  it('orders categories by label alphabetically', async () => {
    const { result } = renderHook(
      () =>
        useDataSeries(
          [
            {
              key: 'Cat1',
              label: 'Cat1',
              aggregatedValue: 0,
              data: [],
            },
            {
              key: 'Cat3',
              label: 'Cat3',
              aggregatedValue: 0,
              data: [],
            },
            {
              key: 'Cat2',
              label: 'Cat2',
              aggregatedValue: 0,
              data: [],
            },
          ],
          {
            entityNamePlural: 'risk_other',
          },
          {
            chartType: 'bar',
            enablePointColors: false,
          }
        ),
      {
        wrapper: getWrapper(defaultMocks, 'graphql', 'features'),
      }
    );
    await waitFor(() => {
      expect(result.current).toEqual([
        {
          data: [
            { x: 'Cat1', y: 0 },
            { x: 'Cat2', y: 0 },
            { x: 'Cat3', y: 0 },
          ],
          type: 'bar',
          title: 'Risks',
          color: '#00DECB',
        },
      ]);
    });
  });

  it('orders categories by sortKey alphabetically when supplied', async () => {
    const { result } = renderHook(
      () =>
        useDataSeries(
          [
            {
              key: 'Cat1',
              label: 'Cat1',
              sortKey: 'Cat2',
              aggregatedValue: 0,
              data: [],
            },
            {
              key: 'Cat3',
              label: 'Cat3',
              sortKey: 'Cat1',
              aggregatedValue: 0,
              data: [],
            },
            {
              key: 'Cat2',
              label: 'Cat2',
              sortKey: 'Cat3',
              aggregatedValue: 0,
              data: [],
            },
          ],
          {
            entityNamePlural: 'risk_other',
          },
          {
            chartType: 'bar',
            enablePointColors: false,
          }
        ),
      {
        wrapper: getWrapper(defaultMocks, 'graphql', 'features'),
      }
    );
    await waitFor(() => {
      expect(result.current).toEqual([
        {
          data: [
            { x: 'Cat3', y: 0 },
            { x: 'Cat1', y: 0 },
            { x: 'Cat2', y: 0 },
          ],
          type: 'bar',
          title: 'Risks',
          color: '#00DECB',
        },
      ]);
    });
  });

  it('orders sub categories by label alphabetically', async () => {
    const { result } = renderHook(
      () =>
        useDataSeries(
          [
            {
              key: 'Cat1',
              label: 'Cat1',
              aggregatedValue: 0,
              data: [],
              subCategories: [
                {
                  key: 'SubCat2',
                  label: 'SubCat2',
                  aggregatedValue: 0,
                  data: [],
                },
                {
                  key: 'SubCat1',
                  label: 'SubCat1',
                  aggregatedValue: 0,
                  data: [],
                },
                {
                  key: 'SubCat3',
                  label: 'SubCat3',
                  aggregatedValue: 0,
                  data: [],
                },
              ],
            },
          ],
          {
            entityNamePlural: 'risk_other',
          },
          {
            chartType: 'bar',
            enablePointColors: false,
          }
        ),
      {
        wrapper: getWrapper(defaultMocks, 'graphql', 'features'),
      }
    );

    await waitFor(() => {
      expect(result.current).toEqual([
        {
          color: '#00DECB',
          data: [{ x: 'Cat1', y: 0 }],
          type: 'bar',
          title: 'SubCat1',
        },
        {
          color: '#c33d69',
          data: [{ x: 'Cat1', y: 0 }],
          type: 'bar',
          title: 'SubCat2',
        },
        {
          color: '#688ae8',
          data: [{ x: 'Cat1', y: 0 }],
          type: 'bar',
          title: 'SubCat3',
        },
      ]);
    });
  });

  it('orders sub categories by sortKey alphabetically if available', async () => {
    const { result } = renderHook(
      () =>
        useDataSeries(
          [
            {
              key: 'Cat1',
              label: 'Cat1',
              aggregatedValue: 0,
              data: [],
              subCategories: [
                {
                  key: 'SubCat2',
                  label: 'SubCat2',
                  sortKey: 'SubCat3',
                  aggregatedValue: 0,
                  data: [],
                },
                {
                  key: 'SubCat1',
                  label: 'SubCat1',
                  sortKey: 'SubCat1',
                  aggregatedValue: 0,
                  data: [],
                },
                {
                  key: 'SubCat3',
                  label: 'SubCat3',
                  sortKey: 'SubCat2',
                  aggregatedValue: 0,
                  data: [],
                },
              ],
            },
          ],
          {
            entityNamePlural: 'risk_other',
          },
          {
            chartType: 'bar',
            enablePointColors: false,
          }
        ),
      {
        wrapper: getWrapper(defaultMocks, 'graphql', 'features'),
      }
    );

    await waitFor(() => {
      expect(result.current).toEqual([
        {
          color: '#00DECB',
          data: [{ x: 'Cat1', y: 0 }],
          type: 'bar',
          title: 'SubCat1',
        },
        {
          color: '#c33d69',
          data: [{ x: 'Cat1', y: 0 }],
          type: 'bar',
          title: 'SubCat3',
        },
        {
          color: '#688ae8',
          data: [{ x: 'Cat1', y: 0 }],
          type: 'bar',
          title: 'SubCat2',
        },
      ]);
    });
  });

  it('includes point colors when enablePointColors is true (radar chart behavior)', async () => {
    const { result } = renderHook(
      () =>
        useDataSeries(
          [
            {
              key: 'Cat1',
              label: 'Cat1',
              aggregatedValue: 5,
              data: [],
            },
            {
              key: 'Cat2',
              label: 'Cat2',
              aggregatedValue: 10,
              data: [],
            },
          ],
          {
            entityNamePlural: 'risk_other',
          },
          {
            chartType: 'column',
            enablePointColors: true,
          }
        ),
      {
        wrapper: getWrapper(defaultMocks, 'graphql', 'features'),
      }
    );

    await waitFor(() => {
      expect(result.current).toEqual([
        {
          data: [
            { x: 'Cat1', y: 5, color: '#00DECB' },
            { x: 'Cat2', y: 10, color: '#c33d69' },
          ],
          type: 'column',
          title: 'Risks',
          color: '#00DECB',
        },
      ]);
    });
  });

  it('excludes point colors when enablePointColors is false (bar chart behavior)', async () => {
    const { result } = renderHook(
      () =>
        useDataSeries(
          [
            {
              key: 'Cat1',
              label: 'Cat1',
              aggregatedValue: 5,
              data: [],
            },
            {
              key: 'Cat2',
              label: 'Cat2',
              aggregatedValue: 10,
              data: [],
            },
          ],
          {
            entityNamePlural: 'risk_other',
          },
          {
            chartType: 'bar',
            enablePointColors: false,
          }
        ),
      {
        wrapper: getWrapper(defaultMocks, 'graphql', 'features'),
      }
    );

    await waitFor(() => {
      expect(result.current).toEqual([
        {
          data: [
            { x: 'Cat1', y: 5 },
            { x: 'Cat2', y: 10 },
          ],
          type: 'bar',
          title: 'Risks',
          color: '#00DECB',
        },
      ]);
    });
  });
});
