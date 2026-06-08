import type { Locator, Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { DeleteModal } from './modals/DeleteModal';
import { QuestionnaireDetailsTab } from './tabs/QuestionnaireDetailsTab';
import { QuestionnaireVersionsTab } from './tabs/QuestionnaireVersionsTab';

export class QuestionnaireDetailsPage extends BasePage {
  readonly detailsTab: QuestionnaireDetailsTab;
  readonly versionsTab: QuestionnaireVersionsTab;
  readonly deleteButton: Locator;
  readonly deleteModal: DeleteModal;

  constructor(page: Page) {
    super(page);

    this.detailsTab = new QuestionnaireDetailsTab(page, 'details');
    this.versionsTab = new QuestionnaireVersionsTab(page, 'versions');

    this.deleteButton = page.getByRole('button', {
      name: 'Delete Questionnaire',
    });
    this.deleteModal = new DeleteModal(page);
  }
}
