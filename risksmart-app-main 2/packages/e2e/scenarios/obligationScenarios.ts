import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { ComplianceRegisterPage } from '../models/ComplianceRegisterPage';
import type { ObligationFormValues } from '../models/forms/ObligationForm';
import { ObligationDetailsPage } from '../models/ObligationDetailsPage';

export class ObligationScenarios {
  readonly page: Page;
  readonly complianceRegister: ComplianceRegisterPage;
  readonly obligationDetailsPage: ObligationDetailsPage;

  constructor(page: Page) {
    this.page = page;
    this.complianceRegister = new ComplianceRegisterPage(page);
    this.obligationDetailsPage = new ObligationDetailsPage(page);
  }

  /**
   * Creates an obligation
   *
   * @param obligation
   */
  async createObligation(obligation: Partial<ObligationFormValues>) {
    await this.navigateToCreateObligationPage();

    await this.obligationDetailsPage.detailsTab.obligationForm.fillFormAndClickSave(
      obligation
    );
    await this.obligationDetailsPage.notificationBanner.expectNotification(
      'Obligation added successfully'
    );
    await expect(this.obligationDetailsPage.header.title).toHaveText(
      obligation?.title ?? ''
    );
  }

  async navigateToCreateObligationPage() {
    await this.complianceRegister.navigateToAndAssertTitle();
    await this.complianceRegister.addButton.click();
    await expect(this.obligationDetailsPage.header.title).toHaveText(
      `Add Obligation`
    );
  }
}
