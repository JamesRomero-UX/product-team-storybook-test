import type { Locator, Page } from '@playwright/test';

import { TableComponent } from '../components/TableComponent';
import { AddDepartmentModal } from '../modals/AddDepartmentModal';
import { Tab } from './Tab';

export class DepartmentsTab extends Tab {
  readonly table: TableComponent;
  readonly addButton: Locator;
  readonly deleteButton: Locator;
  readonly addDepartmentModal: AddDepartmentModal;
  constructor(page: Page) {
    super(page, 'departments');
    this.table = new TableComponent(page);
    this.addButton = this.tabContent.getByText('Add Department');
    this.deleteButton = this.tabContent.getByText('Delete', { exact: true });
    this.addDepartmentModal = new AddDepartmentModal(page);
  }
}
