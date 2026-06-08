import type { Locator, Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { IndicatorForm } from './forms/IndicatorForm';
import { DeleteModal } from './modals/DeleteModal';
import { IndicatorResultsTab } from './tabs/IndicatorResultsTab';

export class IndicatorDetailsPage extends BasePage {
  readonly deleteButton: Locator;
  readonly deleteModal: DeleteModal;
  readonly indicatorForm: IndicatorForm;
  readonly resultsTab: IndicatorResultsTab;

  constructor(page: Page) {
    super(page);
    this.deleteButton = page.getByRole('button', { name: 'Delete Indicator' });
    this.deleteModal = new DeleteModal(page);
    this.indicatorForm = new IndicatorForm(page);
    this.resultsTab = new IndicatorResultsTab(page);
  }
}
