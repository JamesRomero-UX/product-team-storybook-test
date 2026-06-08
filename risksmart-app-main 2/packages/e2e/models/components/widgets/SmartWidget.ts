import createWrapper from '@cloudscape-design/board-components/test-utils/selectors';
import type { Locator, Page } from '@playwright/test';
import type { PieChartWrapper } from '@risk-smart/themed-cloudscape-components/test-utils/selectors';

import { WidgetSettingsForm } from '../../forms/WidgetSettingsForm';

export class SmartWidget {
  readonly page: Page;
  readonly configureWidgetButton: Locator;
  readonly settingsForm: WidgetSettingsForm;
  readonly pieChartWrapper: PieChartWrapper;

  constructor(page: Page) {
    this.page = page;
    this.configureWidgetButton = page.getByText('Configure Widget');
    this.settingsForm = new WidgetSettingsForm(page);
    this.pieChartWrapper = createWrapper().findPieChart();
  }
}
