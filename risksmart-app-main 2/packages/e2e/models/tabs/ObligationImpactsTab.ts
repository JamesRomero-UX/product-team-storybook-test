import type { Locator, Page } from '@playwright/test';

import { TableComponent } from '../components/TableComponent';
import { ObligationImpactModal } from '../modals/ObligationImpactModal';
import { Tab } from './Tab';

export class ObligationImpactsTab extends Tab {
  readonly table: TableComponent;
  readonly addButton: Locator;
  readonly deleteButton: Locator;
  readonly impactModal: ObligationImpactModal;

  constructor(page: Page) {
    super(page, 'impacts');
    this.table = new TableComponent(page);
    this.addButton = this.header.getByRole('button', {
      name: 'Add Impact',
    });
    this.deleteButton = this.header.getByRole('button', {
      name: 'Delete Impact',
    });
    this.impactModal = new ObligationImpactModal(page);
  }
}
