import { expect, type Locator, type Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { TableComponent } from './components/TableComponent';

export class ComplianceRegisterPage extends BasePage {
  readonly addButton: Locator;

  readonly table: TableComponent;

  constructor(page: Page) {
    super(page);

    this.addButton = this.header.headerSection.getByRole('link', {
      name: 'Add Obligation',
    });
    this.table = new TableComponent(page);
  }

  private async navigateTo() {
    await this.navigation.navigateToChild('Compliance', 'Register');
  }
  async navigateToAndAssertTitle() {
    await this.navigateTo();
    await expect(this.header.title).toHaveText(`Compliance Register`);
  }
}
