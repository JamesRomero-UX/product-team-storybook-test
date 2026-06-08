import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { TableComponent } from './components/TableComponent';
import { CustomDatasourceForm } from './forms/CustomDatasourceForm';
import { DeleteModal } from './modals/DeleteModal';

export class CustomDatasourceUpdatePage extends BasePage {
  readonly form: CustomDatasourceForm;
  readonly table: TableComponent;
  readonly deleteButton: Locator;
  readonly deleteModal: DeleteModal;

  constructor(page: Page) {
    super(page);
    this.deleteModal = new DeleteModal(page);
    this.deleteButton = this.header.headerSection.getByRole('button', {
      name: 'Delete',
    });
    this.form = new CustomDatasourceForm(page);
    this.table = new TableComponent(page);
  }
}
