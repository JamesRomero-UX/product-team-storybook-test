import type { Locator, Page } from '@playwright/test';

import { TableComponent } from '../components/TableComponent';
import { ActionUpdateForm } from '../forms/ActionUpdateForm';
import { Tab } from './Tab';

export class ActionUpdateTab extends Tab {
  readonly actionUpdateForm: ActionUpdateForm;
  readonly table: TableComponent;
  readonly addButton: Locator;

  constructor(page: Page) {
    super(page, 'updates');
    this.actionUpdateForm = new ActionUpdateForm(page);
    this.table = new TableComponent(page);
    this.addButton = this.header.getByRole('button', { name: 'Add update' });
  }
}
