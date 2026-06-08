import type { Page } from '@playwright/test';

import type { RatingFormFields } from '../models/forms/RatingForm';
import { RiskDetailsPage } from '../models/RiskDetailsPage';

export class RiskRatingScenarios {
  readonly page: Page;
  readonly riskDetailsPage: RiskDetailsPage;

  constructor(page: Page) {
    this.page = page;

    this.riskDetailsPage = new RiskDetailsPage(page);
  }

  /**
   * Creates a risk rating from the risk details page.
   * @param {RatingFormFields} rating - The rating details to be created.
   * @returns {Promise<void>} - A promise that resolves when the rating is created.
   */
  async createRiskRatingFromRiskDetailsPage(rating: Partial<RatingFormFields>) {
    const ratingCount =
      await this.riskDetailsPage.ratingsTab.riskRatingTable.getRowCount();
    await this.riskDetailsPage.ratingsTab.selectTab();
    await this.riskDetailsPage.ratingsTab.addButton.click();
    const ratingForm = this.riskDetailsPage.ratingsTab.ratingModal.ratingForm;
    await ratingForm.fillFormAndClickSave(rating);

    await this.riskDetailsPage.notificationBanner.expectNotification(
      'Finding added successfully'
    );
    await this.riskDetailsPage.ratingsTab.riskRatingTable.expectRowCount(
      ratingCount + 1
    );
  }
}
