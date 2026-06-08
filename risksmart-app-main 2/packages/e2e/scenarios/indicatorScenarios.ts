import type { Page } from '@playwright/test';

import type { IndicatorFormValues } from '../models/forms/IndicatorForm';
import { RiskDetailsPage } from '../models/RiskDetailsPage';

export class IndicatorScenarios {
  readonly page: Page;

  readonly riskDetailsPage: RiskDetailsPage;

  constructor(page: Page) {
    this.page = page;
    this.riskDetailsPage = new RiskDetailsPage(page);
  }

  /**
   * Creates an indicator from the risk details page
   *
   * @param indicator
   */
  async createIndicatorFromRiskDetails(
    indicator: Partial<IndicatorFormValues>
  ) {
    const riskDetailsPage = new RiskDetailsPage(this.page);
    const tab = riskDetailsPage.indicatorsTab;
    const form = tab.indicatorModal.indicatorForm;
    await tab.selectTabAndAssertTitle('Indicators');
    const rowCount = await tab.table.getRowCount();
    await tab.addButton.click();
    await form.fillFormAndClickSave(indicator);
    await riskDetailsPage.notificationBanner.expectNotification(
      'Indicator added successfully'
    );
    await tab.table.expectRowCount(rowCount + 1);
  }
}
