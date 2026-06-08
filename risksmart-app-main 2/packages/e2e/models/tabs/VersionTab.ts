import type { Locator, Page } from '@playwright/test';

import { TableComponent } from '../components/TableComponent';
import { Tab } from './Tab';

export class VersionTab extends Tab {
  readonly table: TableComponent;
  readonly addButton: Locator;
  readonly deleteButton: Locator;
  constructor(page: Page) {
    super(page, 'files');
    this.table = new TableComponent(page);
    this.addButton = this.header.getByRole('button', { name: 'Add Version' });
    this.deleteButton = this.header.getByRole('button', { name: 'Delete' });
  }
}
