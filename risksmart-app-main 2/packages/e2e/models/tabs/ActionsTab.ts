import type { Locator, Page } from '@playwright/test';

import { TableComponent } from '../components/TableComponent';
import { ActionModal } from '../modals/ActionModal';
import { Tab } from './Tab';

export class ActionsTab extends Tab {
  readonly table: TableComponent;
  readonly addButton: Locator;
  readonly addActionModal: ActionModal;

  constructor(page: Page) {
    super(page, 'actions');
    this.table = new TableComponent(page);
    this.addButton = this.header.getByRole('button', {
      name: 'Add Action',
    });
    this.addActionModal = new ActionModal(page);
  }
}
