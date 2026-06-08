import type { Locator, Page } from '@playwright/test';

import { EnterpriseRiskPage } from './EnterpriseRiskPage';
import { DeleteModal } from './modals/DeleteModal';

export class EnterpriseRiskDetailsPage extends EnterpriseRiskPage {
  readonly deleteButton: Locator;
  readonly deleteModal: DeleteModal;

  constructor(page: Page) {
    super(page);
    this.deleteButton = page.getByRole('button', { name: 'Delete' });
    this.deleteModal = new DeleteModal(page);
  }
}
