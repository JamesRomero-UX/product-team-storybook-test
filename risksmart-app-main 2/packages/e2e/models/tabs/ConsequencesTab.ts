import type { Locator, Page } from '@playwright/test';

import { TableComponent } from '../components/TableComponent';
import { ConsequenceModal } from '../modals/ConsequenceModal';
import { Tab } from './Tab';

export class ConsequencesTab extends Tab {
  readonly table: TableComponent;
  readonly addButton: Locator;
  readonly deleteButton: Locator;
  readonly consequenceModal: ConsequenceModal;

  constructor(page: Page) {
    super(page, 'consequences');
    this.table = new TableComponent(page);
    this.addButton = this.header.getByRole('button', {
      name: 'Add Consequence',
    });
    this.deleteButton = this.header.getByRole('button', {
      name: 'Delete',
    });
    this.consequenceModal = new ConsequenceModal(page);
  }
}
