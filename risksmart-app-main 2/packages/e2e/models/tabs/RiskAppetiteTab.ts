import type { Locator, Page } from '@playwright/test';

import { TableComponent } from '../components/TableComponent';
import { DeleteModal } from '../modals/DeleteModal';
import { Tab } from './Tab';

export class RiskAppetiteTab extends Tab {
  readonly table: TableComponent;
  readonly addButton: Locator;
  readonly deleteButton: Locator;
  readonly deleteModal: DeleteModal;

  constructor(page: Page) {
    super(page, 'appetites');
    this.table = new TableComponent(page);
    this.addButton = this.header.getByRole('link', {
      name: 'Add Appetite',
    });
    this.deleteButton = this.page.getByRole('button', { name: 'Delete' });
    this.deleteModal = new DeleteModal(page);
  }
}
