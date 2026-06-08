import { expect, type Page } from '@playwright/test';

import { AppetiteDetailsPage } from '../models/AppetiteDetailsPage';
import type { AppetiteFormFields } from '../models/forms/AppetiteForm';
import { RiskDetailsPage } from '../models/RiskDetailsPage';

export class AppetiteScenarios {
  readonly page: Page;
  readonly riskDetailsPage: RiskDetailsPage;
  readonly appetiteDetailsPage: AppetiteDetailsPage;

  constructor(page: Page) {
    this.page = page;
    this.riskDetailsPage = new RiskDetailsPage(page);
    this.appetiteDetailsPage = new AppetiteDetailsPage(page);
  }

  /**
   * Create an appetite from the risk details tab
   *
   * @param appetite
   */
  async createAppetiteFromRiskDetails(appetite: Partial<AppetiteFormFields>) {
    const appetitesTab = this.riskDetailsPage.riskAppetiteTab;
    await appetitesTab.selectTabAndAssertTitle('Appetite');
    const rowCount = await appetitesTab.table.getRowCount();
    await appetitesTab.addButton.click();
    await expect(this.appetiteDetailsPage.header.title).toHaveText(
      'Add Appetite'
    );

    const appetiteForm = this.appetiteDetailsPage.detailsTab.appetiteForm;
    await appetiteForm.fillFormAndClickSave(appetite);

    await this.riskDetailsPage.notificationBanner.expectNotification(
      'Appetite added successfully'
    );
    await appetitesTab.table.expectRowCount(rowCount + 1);
  }
}
