import type { Locator, Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { DeleteModal } from './modals/DeleteModal';
import { ActionsTab } from './tabs/ActionsTab';
import { IndicatorsTab } from './tabs/IndicatorsTab';
import { PerformanceTab } from './tabs/PerformanceTab';

export class ControlDetailsPage extends BasePage {
  readonly deleteButton: Locator;
  readonly deleteModal: DeleteModal;

  readonly actionsTab: ActionsTab;
  readonly indicatorsTab: IndicatorsTab;
  readonly performanceTab: PerformanceTab;

  constructor(page: Page) {
    super(page);
    this.deleteButton = page.getByRole('button', { name: 'Delete' });
    this.deleteModal = new DeleteModal(page);
    this.actionsTab = new ActionsTab(page);
    this.indicatorsTab = new IndicatorsTab(page);
    this.performanceTab = new PerformanceTab(page);
  }
}
