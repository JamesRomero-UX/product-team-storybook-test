import type { Page } from '@playwright/test';

import type { ImpactRatingValues } from '../models/forms/ImpactRatingsForm';
import { RiskDetailsPage } from '../models/RiskDetailsPage';

export class ImpactRatingScenarios {
  readonly riskDetailsPage: RiskDetailsPage;

  constructor(page: Page) {
    this.riskDetailsPage = new RiskDetailsPage(page);
  }

  /**
   * Creates an impact rating
   *
   * @param impact Rating
   */
  async createImpactRatingFromRiskDetailPage(
    impactRating: Partial<ImpactRatingValues>
  ) {
    await this.riskDetailsPage.impactsTab.selectTabAndAssertTitle('Ratings');
    const rowCount = await this.riskDetailsPage.impactsTab.table.getRowCount();

    await this.riskDetailsPage.impactsTab.addButton.click();
    const impactForm =
      this.riskDetailsPage.impactsTab.addRatingsModal.impactRatingsForm;
    await impactForm.fillFormAndClickSave(impactRating);

    await this.riskDetailsPage.notificationBanner.expectNotification(
      'Impact rating added successfully'
    );
    await this.riskDetailsPage.impactsTab.table.expectRowCount(rowCount + 1);
  }
}
