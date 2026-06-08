import type { Locator, Page } from '@playwright/test';

import { TableComponent } from '../components/TableComponent';
import { AddRatingsModal } from '../modals/AddRatingsModal';
import { Tab } from './Tab';

export class ImpactsTab extends Tab {
  readonly table: TableComponent;
  readonly addButton: Locator;
  readonly deleteButton: Locator;
  readonly addRatingsModal: AddRatingsModal;

  constructor(page: Page) {
    super(page, 'impacts');
    this.table = new TableComponent(page);

    this.addButton = this.header.getByRole('button', { name: 'Add Ratings' });
    this.deleteButton = this.header.getByRole('button', { name: 'Delete' });
    this.addRatingsModal = new AddRatingsModal(page);
  }
}
