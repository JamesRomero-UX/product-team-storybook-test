import type { Locator, Page } from '@playwright/test';

import { TableComponent } from '../components/TableComponent';
import { AddTagModal } from '../modals/AddTagModal';
import { Tab } from './Tab';

export class TagsTab extends Tab {
  readonly table: TableComponent;
  readonly addButton: Locator;
  readonly deleteButton: Locator;
  readonly addTagModal: AddTagModal;
  constructor(page: Page) {
    super(page, 'tags');
    this.table = new TableComponent(page);
    this.addButton = this.tabContent.getByText('Add Tag');
    this.deleteButton = this.tabContent.getByText('Delete', { exact: true });
    this.addTagModal = new AddTagModal(page);
  }
}
