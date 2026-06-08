import type { Locator, Page } from '@playwright/test';

import { TableComponent } from '../components/TableComponent';
import { ApproversModal } from '../modals/ApproversModal';
import { Tab } from './Tab';

export class ApproversTab extends Tab {
  readonly table: TableComponent;
  readonly addButton: Locator;
  readonly approversModal: ApproversModal;

  constructor(page: Page) {
    super(page, 'approvals');
    this.table = new TableComponent(page);
    this.addButton = this.header.getByRole('button', {
      name: 'Add Approval',
    });
    this.approversModal = new ApproversModal(page);
  }
}
