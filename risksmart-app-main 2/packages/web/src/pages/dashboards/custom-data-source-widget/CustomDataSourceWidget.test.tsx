import type { AggregateType } from '@risksmart-app/shared/reporting/schema';
import { render, screen, waitFor } from '@testing-library/react';
import { forwardRef } from 'react';
import { useDashboardWidgetSettings } from 'src/context/useDashboardWidgetSettings';
import { useColourPalette } from 'src/hooks/useColourPalette';
import type { TypedCustomDatasource } from 'src/pages/custom-datasources/types';
import { mockedGetAllFormCustomisationResponse } from 'src/testing/mock-data/mockedGetAllFormCustomisationResponse';
import { mockedGetCustomDatasourceById } from 'src/testing/mock-data/mockedGetCustomDatasourceById';
import { mockedGetFormConfiguration } from 'src/testing/mock-data/mockedGetFormConfiguration';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedGetReportData } from 'src/testing/mock-data/mockedGetReportData';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import getMyItemWidgets from '../my-items/privateWidgets';
import { setWidgets as setMyItemWidgets } from '../my-items/widgets';
import { WidgetContextProvider } from '../widget-context/WidgetContext';
import { privateWidgets } from '../widgetPrivate';
import { setWidgets } from '../widgets';
import { CustomDataSourceWidget } from './CustomDataSourceWidget';
import type { CustomDataSourceWidgetSettings } from './form/customDataSourceWidgetSettingsSchema';

setWidgets(privateWidgets);
setMyItemWidgets(getMyItemWidgets());

vi.mock('src/context/useDashboardWidgetSettings');
vi.mock('@/hooks/useColourPalette');
const useColourPaletteMock = vi.mocked(useColourPalette);

const useDashboardWidgetSettingsMock = vi.mocked(useDashboardWidgetSettings);

const CustomDataSourceWidgetTest = forwardRef(CustomDataSourceWidget);
const customDataSourceId = '1eaabc71-a2d8-4092-ae21-25df89cf0cd9';

const providers: Providers[] = ['router', 'graphql', 'features', 'trpc'];

const defaultCustomDatasource: TypedCustomDatasource = {
  Title: 'My Custom Datasource',
  Id: '653bd1d4-76ab-425a-aa2e-887b8ef3cb6c',
  Datasources: [
    {
      type: 'risks',
    },
  ],
  Fields: [
    {
      dataSourceIndex: 0,
      fieldId: 'createdAtTimestamp',
    },
  ],
  CreatedByUser: '153bd1d4-76ab-425a-aa2e-887b8ef3cb6c',
  ModifiedByUser: 'TestUser',
  CreatedAtTimestamp: '2025-05-07T10:30:00+01:00',
  ModifiedAtTimestamp: '2025-05-07T10:30:00+01:00',
};

describe('CustomDatasourceWidget', () => {
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

  it('does not error on render', () => {
    useDashboardWidgetSettingsMock.mockReturnValue([null, vi.fn()]);
    const renderResult = render(<CustomDataSourceWidgetTest />, {
      wrapper: getWrapper(
        [
          mockedGetOrganisation(),
          mockedGetOrganisationModuleResponse(),
          mockedGetFormConfiguration({ where: {} }),
          mockedGetAllFormCustomisationResponse(),
        ],
        ...providers
      ),
    });

    expect(() => renderResult).not.toThrow();
  });

  it('shows "Not configured" prior to widget being configured', async () => {
    useDashboardWidgetSettingsMock.mockReturnValue([null, vi.fn()]);
    render(<CustomDataSourceWidgetTest />, {
      wrapper: getWrapper(
        [
          mockedGetOrganisation(),
          mockedGetOrganisationModuleResponse(),
          mockedGetFormConfiguration({ where: {} }),
          mockedGetAllFormCustomisationResponse(),
        ],
        ...providers
      ),
    });
    await waitFor(() => {
      expect(screen.getByText('Not configured')).toBeInTheDocument();
    });
  });

  it('shows "Not configured" when the settings are not valid', async () => {
    const settings: CustomDataSourceWidgetSettings = {
      chartType: 'bar',
      // Missing grouping
      customDataSourceId,
    };
    useDashboardWidgetSettingsMock.mockReturnValue([settings, vi.fn()]);

    render(
      <WidgetContextProvider value={{ widgetId: '123' }}>
        <CustomDataSourceWidgetTest />
      </WidgetContextProvider>,
      {
        wrapper: getWrapper(
          [
            mockedGetOrganisation(),
            mockedGetOrganisationModuleResponse(),
            mockedGetFormConfiguration({ where: {} }),
            mockedGetCustomDatasourceById(
              { Id: customDataSourceId },
              { custom_datasource_by_pk: null }
            ),
            mockedGetAllFormCustomisationResponse(),
          ],
          ...providers
        ),
      }
    );
    await waitFor(() => {
      expect(screen.getByText('Not configured')).toBeInTheDocument();
    });
  });

  it('shows "Custom datasource not found" when datasource not found', async () => {
    const settings: CustomDataSourceWidgetSettings = {
      chartType: 'table',
      customDataSourceId,
    };
    useDashboardWidgetSettingsMock.mockReturnValue([settings, vi.fn()]);

    render(
      <WidgetContextProvider value={{ widgetId: '123' }}>
        <CustomDataSourceWidgetTest />
      </WidgetContextProvider>,
      {
        wrapper: getWrapper(
          [
            mockedGetOrganisation(),
            mockedGetOrganisationModuleResponse(),
            mockedGetFormConfiguration({ where: {} }),
            mockedGetCustomDatasourceById(
              { Id: customDataSourceId },
              { custom_datasource_by_pk: null }
            ),
            mockedGetAllFormCustomisationResponse(),
          ],
          ...providers
        ),
      }
    );
    await waitFor(() => {
      expect(
        screen.getByText('Custom datasource not found')
      ).toBeInTheDocument();
    });
  });

  it.each<{
    aggregationType: AggregateType;
    dataValue: null | number | string;
    aggregateField: string;
    expectedDisplayValue: string;
  }>([
    {
      aggregationType: 'max',
      dataValue: '2025-02-07T10:30:00+01:00',
      aggregateField: 'createdAtTimestamp',
      expectedDisplayValue: '07 Feb',
    },
    {
      aggregationType: 'max',
      dataValue: 3,
      aggregateField: 'inherentRating',
      expectedDisplayValue: 'Moderate',
    },
    {
      aggregationType: 'max',
      dataValue: null,
      aggregateField: 'inherentRating',
      expectedDisplayValue: 'Not specified',
    },
    {
      aggregationType: 'max',
      dataValue: 3.5,
      aggregateField: 'inherentScore',
      expectedDisplayValue: '3.5',
    },
    {
      aggregationType: 'max',
      dataValue: null,
      aggregateField: 'inherentScore',
      expectedDisplayValue: 'Not specified',
    },
    {
      aggregationType: 'sum',
      dataValue: null,
      aggregateField: 'inherentScore',
      expectedDisplayValue: 'Not specified',
    },
  ])(
    'should display $expectedDisplayValue for value $dataValue for $aggregateType aggregation type with risk field $aggregateField on a kpi chart',
    async ({
      aggregateField,
      dataValue,
      expectedDisplayValue,
      aggregationType,
    }) => {
      const settings: CustomDataSourceWidgetSettings = {
        chartType: 'kpi',
        customDataSourceId,
        aggregationType,
        yFieldId: `0|${aggregateField}`,
      };
      useDashboardWidgetSettingsMock.mockReturnValue([settings, vi.fn()]);

      const customDatasource: TypedCustomDatasource = {
        ...defaultCustomDatasource,
        Datasources: [
          {
            type: 'risks',
          },
        ],
        Fields: [
          {
            dataSourceIndex: 0,
            fieldId: aggregateField,
          },
        ],
      };

      render(
        <WidgetContextProvider value={{ widgetId: '123' }}>
          <CustomDataSourceWidgetTest />
        </WidgetContextProvider>,
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedGetOrganisationModuleResponse(),
              mockedGetFormConfiguration({ where: {} }),
              mockedGetCustomDatasourceById(
                { Id: customDataSourceId },
                {
                  custom_datasource_by_pk: customDatasource,
                }
              ),
              mockedGetReportData(
                {
                  dataSources: [{ type: 'risks' }],
                  limit: 100000,
                  filters: undefined,
                  fields: [],
                  groupBy: [],
                  offset: 0,
                  aggregateType: aggregationType,
                  aggregateField: customDatasource.Fields![0],
                },
                {
                  reportingData: [[{ value: dataValue }]],
                }
              ),
              mockedGetAllFormCustomisationResponse(),
            ],
            ...providers
          ),
        }
      );
      await waitFor(() => {
        expect(screen.getByTestId('tile-value')).toHaveTextContent(
          expectedDisplayValue
        );
      });
    }
  );
});
