import type { Locator, Page } from '@playwright/test';

import { TableComponent } from '../components/TableComponent';
import { CauseModal } from '../modals/CauseModal';
import { Tab } from './Tab';

export class CausesTab extends Tab {
  readonly table: TableComponent;
  readonly addButton: Locator;
  readonly deleteButton: Locator;
  readonly causeModal: CauseModal;

  constructor(page: Page) {
    super(page, 'causes');
    this.table = new TableComponent(page);
    this.addButton = this.header.getByRole('button', { name: 'Add Cause' });
    this.deleteButton = this.header.getByRole('button', { name: 'Delete' });
    this.causeModal = new CauseModal(page);
  }
}
