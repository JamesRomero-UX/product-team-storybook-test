import type { Locator, Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { DeleteModal } from './modals/DeleteModal';
import { AppetiteDetailsTab } from './tabs/AppetiteDetailsTab';

export class AppetiteDetailsPage extends BasePage {
  readonly deleteButton: Locator;
  readonly deleteModal: DeleteModal;

  readonly detailsTab: AppetiteDetailsTab;

  constructor(page: Page) {
    super(page);
    this.deleteButton = page.getByRole('button', { name: 'Delete' });
    this.deleteModal = new DeleteModal(page);
    this.detailsTab = new AppetiteDetailsTab(page);
  }
}
