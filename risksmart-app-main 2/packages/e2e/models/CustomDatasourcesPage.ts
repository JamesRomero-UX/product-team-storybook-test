import type { Locator } from '@playwright/test';
import { expect, type Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { TableComponent } from './components/TableComponent';

export class CustomDatasourcesPage extends BasePage {
  readonly table: TableComponent;
  readonly addButton: Locator;

  constructor(page: Page) {
    super(page);
    this.addButton = this.header.headerSection.getByRole('link', {
      name: 'Add Custom Datasource',
    });
    this.table = new TableComponent(page);
  }

  private async navigateTo() {
    await this.navigation.click('Custom Datasources');
  }
  async navigateToAndAssertTitle() {
    await this.navigateTo();
    await expect(this.header.title).toHaveText(`Custom Datasources`);
  }
}
