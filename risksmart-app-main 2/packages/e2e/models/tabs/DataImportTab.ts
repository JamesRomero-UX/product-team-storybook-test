import type { Locator, Page } from '@playwright/test';

import { TableComponent } from '../components/TableComponent';
import { Tab } from './Tab';

export class DataImportTab extends Tab {
  readonly createButton: Locator;
  readonly table: TableComponent;
  constructor(page: Page) {
    super(page, 'dataImport');
    this.createButton = page.getByText('Create Data import');
    this.table = new TableComponent(page);
  }
}
