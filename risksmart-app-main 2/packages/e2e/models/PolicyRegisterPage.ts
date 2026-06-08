import { expect, type Locator, type Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { TableComponent } from './components/TableComponent';

export class PolicyRegisterPage extends BasePage {
  readonly addButton: Locator;
  readonly table: TableComponent;

  constructor(page: Page) {
    super(page);

    const headerSection = page.locator(
      this.cloudScapeWrapper.findHeader().toSelector()
    );

    this.addButton = headerSection.getByRole('link', { name: 'Add Document' });

    this.table = new TableComponent(page);
  }

  private async navigateTo() {
    if (await this.navigation.childNavItemVisible('Policy', 'Documents')) {
      await this.navigation.navigateToChild('Policy', 'Documents');
    }
    await this.navigation.click('Policy');
    if (await this.navigation.childNavItemVisible('Policy', 'Documents')) {
      await this.navigation.clickChild('Policy', 'Documents');
    }
  }
  async navigateToAndAssertTitle() {
    await this.navigateTo();
    await expect(this.header.title).toHaveText(`Policy Register`);
  }
}
