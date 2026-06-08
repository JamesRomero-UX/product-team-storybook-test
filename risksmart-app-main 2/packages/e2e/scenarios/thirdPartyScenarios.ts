import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import type { CustomAttributeValue } from '../models/forms/BaseForm';
import type { ThirdPartyFormValues } from '../models/forms/ThirdPartyForm';
import { ThirdPartyDetailsPage } from '../models/ThirdPartyDetailsPage';
import { ThirdPartyRegisterPage } from '../models/ThirdPartyRegisterPage';

export class ThirdPartyScenarios {
  readonly page: Page;
  readonly thirdPartyRegister: ThirdPartyRegisterPage;
  readonly thirdPartyDetails: ThirdPartyDetailsPage;

  constructor(page: Page) {
    this.page = page;
    this.thirdPartyRegister = new ThirdPartyRegisterPage(page);
    this.thirdPartyDetails = new ThirdPartyDetailsPage(page);
  }

  /**
   * Creates a third party
   *
   * @param thirdParty
   */
  async createThirdParty(
    thirdParty: Partial<ThirdPartyFormValues> &
      Required<Pick<ThirdPartyFormValues, 'title'>>,
    customAttributes?: CustomAttributeValue[]
  ) {
    await this.thirdPartyRegister.navigateToAndAssertTitle();
    await this.thirdPartyRegister.addButton.click();
    await expect(this.thirdPartyDetails.header.title).toHaveText(
      'Add Third Party'
    );

    await this.thirdPartyDetails.detailsTab.thirdPartyForm.fillFormAndClickSave(
      thirdParty,
      customAttributes
    );

    await this.thirdPartyDetails.notificationBanner.expectNotification(
      'Third party added successfully'
    );
    await expect(this.thirdPartyDetails.header.title).toHaveText(
      thirdParty.title
    );
  }

  async navigateToAddThirdPartyPage() {
    await this.thirdPartyRegister.navigateToAndAssertTitle();
    await this.thirdPartyRegister.addButton.click();
    await expect(this.thirdPartyDetails.header.title).toHaveText(
      'Add Third Party'
    );
  }
}
