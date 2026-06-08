import type { Locator, Page } from '@playwright/test';

import { TableComponent } from '../components/TableComponent';
import { AddUsersModal } from '../modals/AddUsersModal';
import { Tab } from './Tab';

export class GroupMembersTab extends Tab {
  readonly table: TableComponent;
  readonly addButton: Locator;
  readonly addUsersModal: AddUsersModal;

  constructor(page: Page) {
    super(page, 'members');
    this.table = new TableComponent(page);
    this.addButton = this.header.getByRole('button', {
      name: 'Add Members',
    });
    this.addUsersModal = new AddUsersModal(page);
  }
}
