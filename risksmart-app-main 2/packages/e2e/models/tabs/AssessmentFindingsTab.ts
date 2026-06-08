import type { Locator, Page } from '@playwright/test';

import { TableComponent } from '../components/TableComponent';
import { Tab } from './Tab';

export class AssessmentFindingsTab extends Tab {
  readonly addButton: Locator;
  readonly table: TableComponent;
  constructor(page: Page) {
    super(page, 'findings');
    this.addButton = this.header.getByRole('button', {
      name: 'Add Finding',
    });
    this.table = new TableComponent(page);
  }
}
