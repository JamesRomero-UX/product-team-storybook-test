import type { Locator, Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { PreviewQuestionnaireModal } from './modals/PreviewQuestionnaireModal';
import { QuestionnaireVersionDetailsTab } from './tabs/QuestionnaireVersionDetailsTab';

export class QuestionnaireVersionDetailsPage extends BasePage {
  readonly detailsTab: QuestionnaireVersionDetailsTab;
  readonly previewButton: Locator;
  readonly previewModal: PreviewQuestionnaireModal;

  constructor(page: Page) {
    super(page);

    this.detailsTab = new QuestionnaireVersionDetailsTab(page, 'details');
    this.previewButton = page.getByRole('button', { name: 'Preview' });
    this.previewModal = new PreviewQuestionnaireModal(page);
  }
}
