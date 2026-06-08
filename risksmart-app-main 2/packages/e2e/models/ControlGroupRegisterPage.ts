import { expect } from '@playwright/test';

import { BasePage } from './BasePage';

export class ControlGroupRegisterPage extends BasePage {
  private async navigateTo() {
    await this.navigation.navigateToChild('Controls', 'Groups');
  }

  async navigateToAndAssertTitle() {
    await this.navigateTo();
    await expect(this.header.title).toHaveText(`Control Groups`);
  }
}
