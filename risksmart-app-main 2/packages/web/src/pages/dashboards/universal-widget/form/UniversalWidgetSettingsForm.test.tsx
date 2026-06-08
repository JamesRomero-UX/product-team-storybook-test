import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import {
  findFormContext,
  getFormField,
  getSaveButton,
} from 'src/testing/formHelpers';
import { defaultMocks } from 'src/testing/mock-data';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetFormConfiguration } from 'src/testing/mock-data/mockedGetFormConfiguration';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetIssues } from 'src/testing/mock-data/mockedGetIssues';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedRoleAccessResponse } from 'src/testing/mock-data/mockedGetRoleAccessResponse';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import getMyItemWidgets from '../../my-items/privateWidgets';
import { setWidgets as setMyItemWidgets } from '../../my-items/widgets';
import { privateWidgets } from '../../widgetPrivate';
import { setWidgets } from '../../widgets';
import { dataSources } from '../data-sources';
import type { GigawidgetSettings } from '../util';
import type { Props } from './UniversalWidgetSettingsForm';
import { UniversalWidgetSettingsForm } from './UniversalWidgetSettingsForm';
import { TestIds } from './UniversalWidgetSettingsFormFieldsTestIds';

setWidgets(privateWidgets);
setMyItemWidgets(getMyItemWidgets());

describe('UniversalWidgetSettingsForm', async () => {
  const testMocks = [
    mockedGetFormCustomisationResponse([
      Parent_Type_Enum.Issue,
      Parent_Type_Enum.IssueAssessment,
    ]),
    mockedGetOrganisation(),
    ...defaultMocks,
    // Multiple instances of mockedGetIssues for each data source test iteration
    mockedGetIssues({
      where: {
        Type: {
          _in: [Parent_Type_Enum.Issue],
        },
        // TODO: Uncomment this to fix console errors in test
        // NOTE: Uncommenting this will create a ts error as parentTypes was removed from the getIssues query
        // parentTypes: [Parent_Type_Enum.Issue, Parent_Type_Enum.IssueAssessment],
      },
    }),
    mockedGetAggregationResponse(),
    mockedGetFormConfiguration({
      where: {
        ParentType: {
          _in: [Parent_Type_Enum.Issue, Parent_Type_Enum.IssueAssessment],
        },
      },
    }),
  ];

  const defaultProps: Props = {
    renderTemplate: (props) => <PageWrapper {...props} />,
    settings: null,
    onSave: vi.fn(),
    onDismiss: vi.fn(),
  };

  const selectDataSource = (container: HTMLElement, dataSource = 'issue') => {
    const dataSourceField = getFormField(container, TestIds.Datasource);
    const dataSourceSelect = dataSourceField?.findControl()?.findSelect();
    dataSourceSelect?.openDropdown();
    dataSourceSelect?.selectOptionByValue(dataSource);
  };

  const selectChartType = (container: HTMLElement, chartType: string) => {
    const chartTypeField = getFormField(container, TestIds.ChartType);
    const chartTypeSelect = chartTypeField?.findControl()?.findSelect();
    chartTypeSelect?.openDropdown();
    chartTypeSelect?.selectOptionByValue(chartType);
  };

  const getCategoryOptions = (container: HTMLElement) => {
    const categoryField = getFormField(container, TestIds.Category);
    const categorySelect = categoryField?.findControl()?.findSelect();
    categorySelect?.openDropdown();

    return Array.from(
      categorySelect?.findDropdown()?.getElement().querySelectorAll('li') ?? []
    ).map((li) => li.innerText.trim());
  };

  const requiredProviders: Providers[] = [
    'dashboardFilter',
    'permission',
    'graphql',
    'router',
    'i18n',
    'trpc',
    'features',
  ];

  it('should display a Datasource dropdown', async () => {
    const { container } = render(
      <UniversalWidgetSettingsForm {...defaultProps} />,

      {
        wrapper: getWrapper(
          [
            mockedGetOrganisation(),
            mockedRoleAccessResponse(),
            mockedGetAggregationResponse(),
            mockedGetOrganisationModuleResponse(),
          ],
          ...requiredProviders
        ),
      }
    );

    await findFormContext();

    const dataSourceField = getFormField(container, TestIds.Datasource);
    expect(dataSourceField?.getElement()).toBeDefined();

    const chartTypeField = getFormField(container, TestIds.ChartType);
    expect(chartTypeField?.getElement()).toBeUndefined();
  });

  it('should display a data sources in alphabetical order', async () => {
    const { container } = render(
      <UniversalWidgetSettingsForm {...defaultProps} />,
      {
        wrapper: getWrapper(
          [
            mockedGetOrganisation(),
            mockedRoleAccessResponse(),
            mockedGetAggregationResponse(),
            mockedGetOrganisationModuleResponse(),
          ],
          ...requiredProviders
        ),
      }
    );
    await findFormContext();

    const dataSourceField = getFormField(container, TestIds.Datasource);
    const dataSourceSelect = dataSourceField?.findControl()?.findSelect();
    dataSourceSelect?.openDropdown();
    const options = dataSourceSelect?.findDropdown().findOptions();
    const labels: string[] = [];
    options?.forEach((o) =>
      labels.push(o.findLabel().getElement().textContent!)
    );
    expect(labels).toEqual([...labels].sort((a, b) => a.localeCompare(b)));
  });

  it('should include Causes in data sources by default (cause module enabled)', async () => {
    const { container } = render(
      <UniversalWidgetSettingsForm {...defaultProps} />,
      {
        wrapper: getWrapper(
          [
            mockedGetOrganisation(),
            mockedRoleAccessResponse(),
            mockedGetAggregationResponse(),
            mockedGetOrganisationModuleResponse(),
          ],
          ...requiredProviders
        ),
      }
    );
    await findFormContext();
    const dataSourceField = getFormField(container, TestIds.Datasource);
    const dataSourceSelect = dataSourceField?.findControl()?.findSelect();
    dataSourceSelect?.openDropdown();
    const options = dataSourceSelect?.findDropdown().findOptions();
    const labels: string[] = [];
    options?.forEach((o) =>
      labels.push(o.findLabel().getElement().textContent!)
    );
    expect(labels.includes('Causes')).toBeTruthy();
  });

  it('should include Consequences in data sources by default (consequence module enabled)', async () => {
    const { container } = render(
      <UniversalWidgetSettingsForm {...defaultProps} />,
      {
        wrapper: getWrapper(
          [
            mockedGetOrganisation(),
            mockedRoleAccessResponse(),
            mockedGetAggregationResponse(),
            mockedGetOrganisationModuleResponse(),
          ],
          ...requiredProviders
        ),
      }
    );
    await findFormContext();
    const dataSourceField = getFormField(container, TestIds.Datasource);
    const dataSourceSelect = dataSourceField?.findControl()?.findSelect();
    dataSourceSelect?.openDropdown();
    const options = dataSourceSelect?.findDropdown().findOptions();
    const labels: string[] = [];
    options?.forEach((o) =>
      labels.push(o.findLabel().getElement().textContent!)
    );
    expect(labels.includes('Consequences')).toBeTruthy();
  });

  it('should exclude Obligations from data sources by default (obligation module disabled)', async () => {
    const { container } = render(
      <UniversalWidgetSettingsForm {...defaultProps} />,
      {
        wrapper: getWrapper(
          [
            mockedGetOrganisation(),
            mockedRoleAccessResponse(),
            mockedGetAggregationResponse(),
            mockedGetOrganisationModuleResponse(),
          ],
          ...requiredProviders
        ),
      }
    );
    await findFormContext();
    const dataSourceField = getFormField(container, TestIds.Datasource);
    const dataSourceSelect = dataSourceField?.findControl()?.findSelect();
    dataSourceSelect?.openDropdown();
    const options = dataSourceSelect?.findDropdown().findOptions();
    const labels: string[] = [];
    options?.forEach((o) =>
      labels.push(o.findLabel().getElement().textContent!)
    );
    expect(!labels.includes('Obligations')).toBeTruthy();
  });

  it('should display Chart Type and Filtering options once a Datasource has been selected', async () => {
    const { container } = render(
      <UniversalWidgetSettingsForm {...defaultProps} />,
      {
        wrapper: getWrapper(testMocks, ...requiredProviders),
      }
    );
    await findFormContext();

    selectDataSource(container, 'issue');

    const chartTypeField = getFormField(container, TestIds.ChartType);
    expect(chartTypeField?.getElement()).toBeDefined();
  });

  it('should NOT display Category or Sub Category when the Table Chart Type is selected', async () => {
    const { container } = render(
      <UniversalWidgetSettingsForm {...defaultProps} />,
      {
        wrapper: getWrapper(testMocks, ...requiredProviders),
      }
    );
    await findFormContext();

    selectDataSource(container, 'issue');

    await waitFor(() => {
      expect(getFormField(container, TestIds.ChartType)).not.toBeNull();
    });
    selectChartType(container, 'table');

    const categoryField = getFormField(container, TestIds.Category);
    expect(categoryField?.getElement()).not.toBeDefined();
  });

  it.each([
    {
      chartType: 'pie',
    },
    {
      chartType: 'donut',
    },
    {
      chartType: 'bar',
    },
    {
      chartType: 'stacked-bar',
    },
  ])(
    'should display a Category when the $chartType Chart Type is selected',
    async ({ chartType }) => {
      const { container } = render(
        <UniversalWidgetSettingsForm {...defaultProps} />,
        {
          wrapper: getWrapper(testMocks, ...requiredProviders),
        }
      );
      await findFormContext();

      selectDataSource(container, 'issue');

      await waitFor(() => {
        expect(getFormField(container, TestIds.ChartType)).not.toBeNull();
      });

      selectChartType(container, chartType);

      await waitFor(() => {
        const categoryField = getFormField(container, TestIds.Category);
        expect(categoryField?.getElement()).toBeDefined();
      });
    }
  );

  it.each([
    {
      chartType: 'bar',
    },
    {
      chartType: 'stacked-bar',
    },
  ])(
    'should display a Sub Category when the $chartType Chart Type is selected',
    async ({ chartType }) => {
      const { container } = render(
        <UniversalWidgetSettingsForm {...defaultProps} />,
        {
          wrapper: getWrapper(testMocks, ...requiredProviders),
        }
      );
      await findFormContext();

      selectDataSource(container, 'issue');

      await waitFor(() => {
        expect(getFormField(container, TestIds.ChartType)).not.toBeNull();
      });

      selectChartType(container, chartType);

      await waitFor(() => {
        const subCategoryField = getFormField(container, TestIds.SubCategory);
        expect(subCategoryField?.getElement()).toBeDefined();
      });
    }
  );

  it.each([
    {
      chartType: 'pie',
    },
    {
      chartType: 'donut',
    },
    {
      chartType: 'bar',
    },
    {
      chartType: 'stacked-bar',
    },
  ])(
    'should display an "Aggregate function" field when the chart type is $chartType',
    async ({ chartType }) => {
      const { container } = render(
        <UniversalWidgetSettingsForm {...defaultProps} />,
        {
          wrapper: getWrapper(testMocks, ...requiredProviders),
        }
      );
      await findFormContext();

      selectDataSource(container, 'issue');

      await waitFor(() => {
        expect(getFormField(container, TestIds.ChartType)).not.toBeNull();
      });

      selectChartType(container, chartType);

      await waitFor(() => {
        const aggregateFunctionField = getFormField(
          container,
          TestIds.AggregateFunction
        );
        expect(aggregateFunctionField?.getElement()).toBeDefined();
      });
    }
  );

  it.each([
    {
      chartType: 'table',
    },
  ])(
    'should NOT display an "Aggregate function" field when the chart type is $chartType',
    async ({ chartType }) => {
      const { container } = render(
        <UniversalWidgetSettingsForm {...defaultProps} />,
        {
          wrapper: getWrapper(testMocks, ...requiredProviders),
        }
      );
      await findFormContext();

      selectDataSource(container, 'issue');

      await waitFor(() => {
        expect(getFormField(container, TestIds.ChartType)).not.toBeNull();
      });

      selectChartType(container, chartType);

      await waitFor(() => {
        const aggregateFunctionField = getFormField(
          container,
          TestIds.AggregateFunction
        );
        expect(aggregateFunctionField?.getElement()).toBeUndefined();
      });
    }
  );

  it('should not lose existing preferences when saved', async () => {
    const onSave = vi.fn();
    const preferences = {
      contentDisplay: [{ visible: false, id: 'test' }],
    };
    const settings: GigawidgetSettings = {
      title: 'Test',
      dataSource: 'issue',
      chartType: 'table',
      categoryGetter: '',
      showFilters: false,
      ignoreDashboardDateFilter: false,
      unit: '',
      filtering: {
        operation: 'and',
        tokens: [],
      },
      precision: undefined,
      customTitle: undefined,
      preferences,
    };

    const { container } = render(
      <UniversalWidgetSettingsForm
        {...defaultProps}
        settings={settings}
        onSave={onSave}
      />,
      {
        wrapper: getWrapper(testMocks, ...requiredProviders),
      }
    );
    await findFormContext();

    await waitFor(() => {
      expect(getFormField(container, TestIds.ChartType)).not.toBeNull();
    });

    await userEvent.click(getSaveButton());

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ preferences })
    );
  });

  it.each(Object.keys(dataSources).map((ds) => ({ dataSource: ds })))(
    'Categories for data source $dataSource support i18n translations for their title correctly',
    async () => {
      const { container } = render(
        <UniversalWidgetSettingsForm {...defaultProps} />,
        {
          wrapper: getWrapper(testMocks, ...requiredProviders),
        }
      );

      await findFormContext();

      selectDataSource(container, 'issue');

      await waitFor(() => {
        expect(getFormField(container, TestIds.ChartType)).not.toBeNull();
      });

      selectChartType(container, 'pie');

      await waitFor(() => {
        expect(getFormField(container, TestIds.Category)).not.toBeNull();
      });

      const options = getCategoryOptions(container);
      expect(options.length).toBeGreaterThan(0);

      // Check that all the translations have worked correctly.
      // None of the options should show $t(...) (which would mean the translation key wasnt found)
      expect(options.some((o) => /\$t\(.*?\)/.test(o))).not.toBeTruthy();
    }
  );
});
