import type { Page } from '@playwright/test';

import type { ImpactFormFields } from '../models/forms/ImpactForm';
import { ImpactsRegisterPage } from '../models/ImpactsRegisterPage';

export class ImpactScenarios {
  readonly page: Page;
  readonly impactRegister: ImpactsRegisterPage;

  constructor(page: Page) {
    this.page = page;
    this.impactRegister = new ImpactsRegisterPage(page);
  }

  /**
   * Creates an impact
   *
   * @param impact
   */
  async createImpact(impact: Partial<ImpactFormFields>) {
    await this.impactRegister.navigateToAndAssertTitle();

    const rowCount = await this.impactRegister.table.getRowCount();
    await this.impactRegister.addImpactButton.click();

    await this.impactRegister.addImpactModal.impactForm.fillFormAndClickSave(
      impact
    );

    await this.impactRegister.notificationBanner.expectNotification(
      'Impact added successfully'
    );

    await this.impactRegister.table.expectRowCount(rowCount + 1);
  }
}
