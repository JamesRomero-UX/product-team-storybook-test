import { expect, type Locator, type Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { TableComponent } from './components/TableComponent';

export class InternalAuditRegisterPage extends BasePage {
  readonly addButton: Locator;

  readonly table: TableComponent;

  constructor(page: Page) {
    super(page);

    this.addButton = this.header.headerSection.getByRole('link', {
      name: 'Add Internal audit',
    });
    this.table = new TableComponent(page);
  }

  private async navigateTo() {
    await this.navigation.navigateToChild('Internal audits', 'Register');
  }

  async navigateToAndAssertTitle() {
    await this.navigateTo();
    await expect(this.header.title).toHaveText(`Internal Audits Register`);
  }

  async clickExpandableParentNavigation() {
    await this.navigation.click('Internal audits');
  }
}
