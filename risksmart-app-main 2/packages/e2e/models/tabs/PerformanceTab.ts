import type { Locator, Page } from '@playwright/test';

import { TableComponent } from '../components/TableComponent';
import { TestResultModal } from '../modals/TestResultModal';
import { Tab } from './Tab';

export class PerformanceTab extends Tab {
  readonly table: TableComponent;
  readonly addButton: Locator;
  readonly deleteButton: Locator;
  readonly addTestResultModal: TestResultModal;

  constructor(page: Page) {
    super(page, 'performance');
    this.table = new TableComponent(page);
    this.deleteButton = page.getByRole('button', { name: 'Delete' });
    this.addButton = this.header.getByRole('button', {
      name: 'Add Test Result',
    });
    this.addTestResultModal = new TestResultModal(page);
  }
}
