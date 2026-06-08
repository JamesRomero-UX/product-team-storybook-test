import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { BasePage } from './BasePage';
import { TableComponent } from './components/TableComponent';

export class ThirdPartyRegisterPage extends BasePage {
  readonly table: TableComponent;
  readonly addButton: Locator;

  constructor(page: Page) {
    super(page);
    this.table = new TableComponent(page);
    this.addButton = this.header.headerSection.getByRole('link', {
      name: 'Add Third Party',
    });
  }
  private async navigateTo() {
    await this.navigation.navigateToChild('Third party', 'Register');
  }

  async navigateToAndAssertTitle() {
    await this.navigateTo();
    await this.assertHeaderTitle();
  }

  async assertHeaderTitle() {
    await expect(this.header.title).toHaveText(`Third Party Register`);
  }
}
