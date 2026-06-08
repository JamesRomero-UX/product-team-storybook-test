import type { Locator, Page } from '@playwright/test';

import { TableComponent } from '../components/TableComponent';
import { Tab } from './Tab';

export class DataImportResultsTab extends Tab {
  readonly table: TableComponent;

  readonly startImportButton: Locator;
  readonly statusBadge: Locator;

  constructor(page: Page) {
    super(page, 'results');
    this.table = new TableComponent(page);
    this.statusBadge = page.getByTestId('dataImportStatus');
    this.startImportButton = this.page.getByText('Start import');
  }
}
