import type { Locator, Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { AcceptanceForm } from './forms/AcceptanceForm';
import { DeleteModal } from './modals/DeleteModal';

export class AcceptanceDetailsPage extends BasePage {
  readonly deleteButton: Locator;
  readonly deleteModal: DeleteModal;
  readonly acceptanceForm: AcceptanceForm;

  constructor(page: Page) {
    super(page);
    this.deleteButton = page.getByRole('button', { name: 'Delete' });
    this.deleteModal = new DeleteModal(page);
    this.acceptanceForm = new AcceptanceForm(page);
  }
}
