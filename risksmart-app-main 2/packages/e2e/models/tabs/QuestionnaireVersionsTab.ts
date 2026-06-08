import type { Locator, Page } from '@playwright/test';

import { TableComponent } from '../components/TableComponent';
import { Tab } from './Tab';

export class QuestionnaireVersionsTab extends Tab {
  table: TableComponent;
  addButton: Locator;

  constructor(page: Page, id: string) {
    super(page, id);
    this.table = new TableComponent(page);
    this.addButton = page.getByRole('button', { name: 'Add Version' });
  }
}
