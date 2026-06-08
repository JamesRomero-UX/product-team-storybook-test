import type { Locator, Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { DeleteModal } from './modals/DeleteModal';
import { ActionsTab } from './tabs/ActionsTab';
import { ObligationDetailsTab } from './tabs/ObligationDetailsTab';
import { ObligationImpactsTab } from './tabs/ObligationImpactsTab';
import { ObligationRatingsTab } from './tabs/ObligationRatingsTab';

export class ObligationDetailsPage extends BasePage {
  readonly deleteButton: Locator;
  readonly deleteModal: DeleteModal;
  readonly actionsTab: ActionsTab;
  readonly detailsTab: ObligationDetailsTab;
  readonly ratingsTab: ObligationRatingsTab;
  readonly impactsTab: ObligationImpactsTab;

  constructor(page: Page) {
    super(page);
    this.deleteButton = page.getByRole('button', { name: 'Delete Obligation' });
    this.deleteModal = new DeleteModal(page);
    this.actionsTab = new ActionsTab(page);
    this.detailsTab = new ObligationDetailsTab(page);
    this.ratingsTab = new ObligationRatingsTab(page);
    this.impactsTab = new ObligationImpactsTab(page);
  }
}
