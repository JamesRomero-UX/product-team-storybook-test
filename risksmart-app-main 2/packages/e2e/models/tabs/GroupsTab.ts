import type { Locator, Page } from '@playwright/test';

import { TableComponent } from '../components/TableComponent';
import { AddGroupModal } from '../modals/AddGroupModal';
import { Tab } from './Tab';

export class GroupsTab extends Tab {
  readonly table: TableComponent;
  readonly addButton: Locator;
  readonly addGroupModal: AddGroupModal;
  constructor(page: Page) {
    super(page, 'groups');
    this.table = new TableComponent(page);
    this.addButton = page.getByText('Add Group');
    this.addGroupModal = new AddGroupModal(page);
  }
}
