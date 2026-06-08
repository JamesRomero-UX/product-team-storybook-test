import type { Locator, Page } from '@playwright/test';

import { TableComponent } from '../components/TableComponent';
import { AcceptanceModal } from '../modals/AcceptanceModal';
import { Tab } from './Tab';

export class RiskAcceptancesTab extends Tab {
  readonly table: TableComponent;
  readonly addButton: Locator;
  readonly deleteButton: Locator;
  readonly addAcceptanceModal: AcceptanceModal;
  constructor(page: Page) {
    super(page, 'acceptances');
    this.table = new TableComponent(page);
    this.addButton = this.header.getByRole('button', {
      name: 'Add Acceptance',
    });
    this.deleteButton = page.getByRole('button', { name: 'Delete' });
    this.addAcceptanceModal = new AcceptanceModal(page);
  }
}
