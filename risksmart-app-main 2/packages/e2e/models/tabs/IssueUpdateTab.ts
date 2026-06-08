import type { Locator, Page } from '@playwright/test';

import { TableComponent } from '../components/TableComponent';
import { IssueUpdateForm } from '../forms/IssueUpdateForm';
import { Tab } from './Tab';

export class IssueUpdateTab extends Tab {
  readonly issueUpdateForm: IssueUpdateForm;
  readonly table: TableComponent;
  readonly addButton: Locator;

  constructor(page: Page) {
    super(page, 'updates');
    this.issueUpdateForm = new IssueUpdateForm(page);
    this.table = new TableComponent(page);
    this.addButton = this.header.getByRole('button', { name: 'Add update' });
  }
}
