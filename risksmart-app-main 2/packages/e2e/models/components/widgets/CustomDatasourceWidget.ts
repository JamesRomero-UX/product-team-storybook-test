import type { Locator, Page } from '@playwright/test';
import type {
  BarChartWrapper,
  PieChartWrapper,
} from '@risk-smart/themed-cloudscape-components/test-utils/selectors';
import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/selectors';

import { CustomDatasourceSettingsForm } from '../../forms/CustomDatasourceSettingsForm';
import { TableComponent } from '../TableComponent';

export class CustomDatasourceWidget {
  readonly page: Page;
  readonly configureWidgetButton: Locator;
  readonly settingsForm: CustomDatasourceSettingsForm;
  readonly kpiValue: Locator;
  readonly table: TableComponent;
  readonly barChartWrapper: BarChartWrapper;
  readonly pieChartWrapper: PieChartWrapper;
  readonly alertContent: Locator;
  constructor(page: Page) {
    this.page = page;
    this.configureWidgetButton = page.getByText('Configure Widget');
    this.settingsForm = new CustomDatasourceSettingsForm(page);
    this.kpiValue = page.getByTestId('tile-value');
    this.table = new TableComponent(page);
    this.pieChartWrapper = createWrapper().findPieChart();
    this.barChartWrapper = createWrapper().findBarChart();
    this.alertContent = page.locator(
      createWrapper().findAlert().findContent().toSelector()
    );
  }
}
