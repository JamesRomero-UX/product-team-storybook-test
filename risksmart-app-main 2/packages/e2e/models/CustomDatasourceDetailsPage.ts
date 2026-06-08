import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { TableComponent } from './components/TableComponent';

export class CustomDatasourceDetailsPage extends BasePage {
  readonly table: TableComponent;
  readonly editButton: Locator;

  constructor(page: Page) {
    super(page);
    this.editButton = this.header.headerSection.getByRole('link', {
      name: 'Edit',
    });
    this.table = new TableComponent(page);
  }
}
