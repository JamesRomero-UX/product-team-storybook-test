import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { TypedCustomDatasource } from 'src/pages/custom-datasources/types';
import { getFormField, selectOptionByLabel } from 'src/testing/formHelpers';
import { mockedGetAllFormCustomisationResponse } from 'src/testing/mock-data/mockedGetAllFormCustomisationResponse';
import { mockedGetCustomDatasources } from 'src/testing/mock-data/mockedGetCustomDatasources';
import { mockedGetFormConfiguration } from 'src/testing/mock-data/mockedGetFormConfiguration';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { it, vi } from 'vitest';

import type { Props } from './CustomDataSourceWidgetSettingsForm';
import { CustomDataSourceWidgetSettingsForm } from './CustomDataSourceWidgetSettingsForm';
import type {
  ChartType,
  CustomDataSourceWidgetSettings,
} from './customDataSourceWidgetSettingsSchema';

describe('CustomDataSourceWidgetSettingsForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps: Props = {
    values: undefined,
    onSave: vi.fn(),
    onDismiss: vi.fn(),
  };
  const providers: Providers[] = [
    'help',
    'graphql',
    'router',
    'features',
    'trpc',
  ];
  const form = () => screen.getByTestId('customDataSourceWidgetSettings');
  const saveButton = () => screen.getByRole('button', { name: 'Save' });
  const chartType = () => getFormField(form(), 'chartType');
  const category = () => getFormField(form(), 'category');
  const subCategoryField = () => getFormField(form(), 'subCategory');
  const dataSourceField = () => getFormField(form(), 'dataSource');
  const aggregateField = () => getFormField(form(), 'aggregateField');

  const aggregationType = () => getFormField(form(), 'aggregationType');
  const dataSourceSelect = () => dataSourceField()?.findControl()?.findSelect();
  const chartTypeSelect = () => chartType()?.findControl()?.findSelect();
  const aggregateFieldSelect = () =>
    aggregateField()?.findControl()?.findSelect();

  const subCategoryFieldSelect = () =>
    subCategoryField()?.findControl()?.findSelect();

  const aggregationTypeSelect = () =>
    aggregationType()?.findControl()?.findSelect();
  const categorySelect = () => category()?.findControl()?.findSelect();

  const selectDatasource = async (customDataSourceId: string) => {
    await waitFor(() => dataSourceSelect());
    dataSourceSelect()!.openDropdown();
    await waitFor(() => {
      expect(
        dataSourceSelect()?.findStatusIndicator()?.getElement().innerHTML
      ).toEqual(undefined);
    });
    dataSourceSelect()!.selectOptionByValue(customDataSourceId);
  };

  it('Chart type is required', { timeout: 10_000 }, async () => {
    const onSave = vi.fn();
    render(
      <CustomDataSourceWidgetSettingsForm {...defaultProps} onSave={onSave} />,
      {
        wrapper: getWrapper(
          [
            mockedGetOrganisation(),
            mockedGetCustomDatasources(),
            mockedGetFormConfiguration({}),
            mockedGetAllFormCustomisationResponse(),
          ],
          ...providers
        ),
      }
    );
    await waitFor(() => expect(saveButton()).toBeDefined());

    fireEvent.click(saveButton());
    await waitFor(() => {
      expect(chartType()?.findError()?.getElement().textContent).toEqual(
        'Required'
      );
    });
  });

  it('Data source is required', { timeout: 10_000 }, async () => {
    const onSave = vi.fn();
    render(
      <CustomDataSourceWidgetSettingsForm {...defaultProps} onSave={onSave} />,
      {
        wrapper: getWrapper(
          [
            mockedGetOrganisation(),
            mockedGetCustomDatasources(),
            mockedGetFormConfiguration({}),
            mockedGetAllFormCustomisationResponse(),
          ],
          ...providers
        ),
      }
    );
    await waitFor(() => expect(saveButton()).toBeDefined());

    fireEvent.click(saveButton());
    await waitFor(() => {
      expect(dataSourceField()?.findError()?.getElement().textContent).toEqual(
        'Required'
      );
    });
  });

  it('Cannot aggregate with table', { timeout: 10_000 }, async () => {
    const onSave = vi.fn();
    const customDataSource = buildCustomDatasource();
    render(
      <CustomDataSourceWidgetSettingsForm {...defaultProps} onSave={onSave} />,
      {
        wrapper: getWrapper(
          [
            mockedGetOrganisation(),
            mockedGetCustomDatasources({
              custom_datasource: [customDataSource],
            }),
            mockedGetFormConfiguration({}),
            mockedGetAllFormCustomisationResponse(),
          ],
          ...providers
        ),
      }
    );

    await selectDatasource(customDataSource.Id);
    selectOptionByLabel(chartTypeSelect()!, 'Table');

    expect(aggregationTypeSelect()).toBeUndefined();
    expect(categorySelect()).toBeUndefined();

    fireEvent.click(saveButton());
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith<[CustomDataSourceWidgetSettings]>({
        aggregationType: null,
        chartType: 'table',
        customDataSourceId: customDataSource.Id,
        showAsPercentage: false,
        x1FieldDatePrecision: undefined,
        x1FieldId: null,
        x2FieldId: null,
        yFieldId: null,
      });
    });
  });

  it(
    'Aggregation fields cleared when changing chart type to table',
    { timeout: 10_000 },
    async () => {
      const onSave = vi.fn();
      const customDataSource = buildCustomDatasource();
      render(
        <CustomDataSourceWidgetSettingsForm
          {...defaultProps}
          onSave={onSave}
        />,
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedGetFormConfiguration({}),
              mockedGetCustomDatasources({
                custom_datasource: [customDataSource],
              }),
              mockedGetAllFormCustomisationResponse(),
            ],
            ...providers
          ),
        }
      );

      await selectDatasource(customDataSource.Id);
      selectOptionByLabel(chartTypeSelect()!, 'Bar Chart');
      selectOptionByLabel(aggregationTypeSelect()!, 'Count');
      selectOptionByLabel(categorySelect()!, 'Risk tier');
      selectOptionByLabel(chartTypeSelect()!, 'Table');

      fireEvent.click(saveButton());
      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith<[CustomDataSourceWidgetSettings]>({
          aggregationType: null,
          chartType: 'table',
          customDataSourceId: customDataSource.Id,
          showAsPercentage: false,
          x1FieldDatePrecision: null,
          x1FieldId: null,
          x2FieldId: null,
          yFieldId: null,
        });
      });
    }
  );

  it(
    'Subcategory value cleared and hidden when changing from bar chart to pie chart',
    { timeout: 10_000 },
    async () => {
      const onSave = vi.fn();
      const customDataSource = buildCustomDatasource();
      render(
        <CustomDataSourceWidgetSettingsForm
          {...defaultProps}
          onSave={onSave}
        />,
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedGetFormConfiguration({}),
              mockedGetCustomDatasources({
                custom_datasource: [customDataSource],
              }),
              mockedGetAllFormCustomisationResponse(),
            ],
            ...providers
          ),
        }
      );

      await selectDatasource(customDataSource.Id);

      selectOptionByLabel(chartTypeSelect()!, 'Bar Chart');
      selectOptionByLabel(aggregationTypeSelect()!, 'Count');
      selectOptionByLabel(categorySelect()!, 'Risk tier');
      selectOptionByLabel(subCategoryFieldSelect()!, 'Risk name');
      selectOptionByLabel(chartTypeSelect()!, 'Pie Chart');

      expect(subCategoryFieldSelect()).toBeUndefined();

      fireEvent.click(saveButton());
      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith<[CustomDataSourceWidgetSettings]>({
          aggregationType: 'count',
          chartType: 'pie',
          customDataSourceId: customDataSource.Id,
          showAsPercentage: false,
          x1FieldDatePrecision: null,
          x1FieldId: '0|tier',
          x2FieldId: null,
          yFieldId: null,
        });
      });
    }
  );

  it.each<{ chartType: ChartType }>([
    {
      chartType: 'bar',
    },
    {
      chartType: 'pie',
    },
    {
      chartType: 'donut',
    },
    {
      chartType: 'stacked-bar',
    },
  ])(
    'Category required for chart type $chartType',
    { timeout: 10_000 },
    async ({ chartType }) => {
      const onSave = vi.fn();
      const customDataSource = buildCustomDatasource();
      render(
        <CustomDataSourceWidgetSettingsForm
          {...defaultProps}
          onSave={onSave}
        />,
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedGetCustomDatasources({
                custom_datasource: [customDataSource],
              }),
              mockedGetFormConfiguration({}),
              mockedGetAllFormCustomisationResponse(),
            ],
            ...providers
          ),
        }
      );

      await selectDatasource(customDataSource.Id);
      chartTypeSelect()!.openDropdown();
      chartTypeSelect()!.selectOptionByValue(chartType);

      fireEvent.click(saveButton());
      await waitFor(() => {
        expect(category()?.findError()?.getElement().textContent).toEqual(
          'Required'
        );
      });
    }
  );

  it(
    'Aggregation field cleared when aggregate function changed to value that doesnt support previous selection',
    { timeout: 10_000 },
    async () => {
      const onSave = vi.fn();
      const customDataSource = buildCustomDatasource();
      render(
        <CustomDataSourceWidgetSettingsForm
          {...defaultProps}
          onSave={onSave}
        />,
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedGetCustomDatasources({
                custom_datasource: [customDataSource],
              }),
              mockedGetFormConfiguration({}),
              mockedGetAllFormCustomisationResponse(),
            ],
            ...providers
          ),
        }
      );

      await selectDatasource(customDataSource.Id);

      selectOptionByLabel(chartTypeSelect()!, 'Bar Chart');
      selectOptionByLabel(categorySelect()!, 'Risk tier');
      selectOptionByLabel(aggregationTypeSelect()!, 'Max');
      selectOptionByLabel(aggregateFieldSelect()!, 'Risk name');
      let value = aggregateFieldSelect()?.getElement().textContent;
      expect(value).toEqual('Risk name');

      selectOptionByLabel(aggregationTypeSelect()!, 'Sum');

      value = aggregateFieldSelect()?.getElement().textContent;
      expect(value).toEqual('Select aggregate field');
    }
  );

  it(
    'Changing the data source clears all options (except chart type)',
    { timeout: 10_000 },
    async () => {
      const onSave = vi.fn();
      const customDataSource1 = buildCustomDatasource();
      const customDataSource2 = buildCustomDatasource();
      render(
        <CustomDataSourceWidgetSettingsForm
          {...defaultProps}
          onSave={onSave}
        />,
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedGetCustomDatasources({
                custom_datasource: [customDataSource1, customDataSource2],
              }),
              mockedGetFormConfiguration({}),
              mockedGetAllFormCustomisationResponse(),
            ],
            ...providers
          ),
        }
      );

      await selectDatasource(customDataSource1.Id);

      selectOptionByLabel(chartTypeSelect()!, 'Bar Chart');
      selectOptionByLabel(categorySelect()!, 'Risk tier');
      selectOptionByLabel(subCategoryFieldSelect()!, 'Risk tier');
      selectOptionByLabel(aggregationTypeSelect()!, 'Max');
      selectOptionByLabel(aggregateFieldSelect()!, 'Risk name');

      await selectDatasource(customDataSource2.Id);

      expect(categorySelect()?.getElement().textContent).toEqual(
        'Select category'
      );
      expect(subCategoryFieldSelect()?.getElement().textContent).toEqual(
        'Select category'
      );
      expect(aggregationTypeSelect()?.getElement().textContent).toEqual(
        'Aggregate function'
      );
      expect(aggregateFieldSelect()).toBe(undefined);
    }
  );

  it(
    'calls onSave on successfully submitted settings',
    { timeout: 10_000 },
    async () => {
      const onSave = vi.fn<Props['onSave']>();
      const customDataSource = buildCustomDatasource();
      render(
        <CustomDataSourceWidgetSettingsForm
          {...defaultProps}
          onSave={onSave}
        />,
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedGetCustomDatasources({
                custom_datasource: [customDataSource],
              }),
              mockedGetFormConfiguration({}),
              mockedGetAllFormCustomisationResponse(),
            ],
            ...providers
          ),
        }
      );

      await selectDatasource(customDataSource.Id);
      selectOptionByLabel(chartTypeSelect()!, 'Tile');
      selectOptionByLabel(aggregationTypeSelect()!, 'Count');

      fireEvent.click(saveButton());
      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith<[CustomDataSourceWidgetSettings]>({
          aggregationType: 'count',
          chartType: 'kpi',
          customDataSourceId: customDataSource.Id,
          showAsPercentage: false,
          x1FieldDatePrecision: undefined,
          x1FieldId: null,
          x2FieldId: null,
          yFieldId: null,
        });
      });
    }
  );
});

const buildCustomDatasource = (
  partial: Partial<TypedCustomDatasource> = {}
): TypedCustomDatasource => {
  return {
    Title: '',
    Id: 'd54eda57-9335-4e1e-981e-8a9169327abc',
    Datasources: [
      {
        type: 'risks',
      },
    ],
    Fields: [
      {
        dataSourceIndex: 0,
        fieldId: 'tier',
      },
      {
        dataSourceIndex: 0,
        fieldId: 'title',
      },
    ],
    CreatedByUser: '',
    ModifiedByUser: '',
    CreatedAtTimestamp: '',
    ModifiedAtTimestamp: '',
    ...partial,
  };
};
