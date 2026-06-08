import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { BasePage } from './BasePage';
import { TableComponent } from './components/TableComponent';

export class CausesRegisterPage extends BasePage {
  table: TableComponent;

  constructor(page: Page) {
    super(page);
    this.table = new TableComponent(page);
  }

  private async navigateTo() {
    await this.navigation.navigateToChild('Issues', 'Causes');
  }

  async navigateToAndAssertTitle() {
    await this.navigateTo();
    await expect(this.header.title).toHaveText(`Causes Register`);
  }
}
