import type { Page } from '@playwright/test';

import type { AcceptanceFormFields } from '../models/forms/AcceptanceForm';
import { RiskDetailsPage } from '../models/RiskDetailsPage';

export class AcceptanceScenarios {
  readonly page: Page;
  readonly riskDetailsPage: RiskDetailsPage;

  constructor(page: Page) {
    this.page = page;
    this.riskDetailsPage = new RiskDetailsPage(page);
  }

  /**
   * Creates an acceptance
   *
   * @param acceptance
   */
  async createAcceptanceFromRiskDetails(
    acceptance: Partial<AcceptanceFormFields>
  ) {
    const acceptanceTab = this.riskDetailsPage.riskAcceptancesTab;
    await acceptanceTab.selectTabAndAssertTitle('Acceptances');
    const acceptanceCount = await acceptanceTab.table.getRowCount();
    await acceptanceTab.addButton.click();
    await acceptanceTab.addAcceptanceModal.acceptanceForm.fillFormAndClickSave(
      acceptance
    );

    await this.riskDetailsPage.notificationBanner.expectNotification(
      'Acceptance added successfully'
    );
    await acceptanceTab.table.expectRowCount(acceptanceCount + 1);
  }
}
