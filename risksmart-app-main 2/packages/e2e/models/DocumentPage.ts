import { type Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { ActionsTab } from './tabs/ActionsTab';
import { DocumentDetailsTab } from './tabs/DocumentDetailsTab';
import { DocumentRatingsTab } from './tabs/DocumentRatingsTab';

export abstract class DocumentPage extends BasePage {
  readonly actionTab: ActionsTab;
  readonly detailsTab: DocumentDetailsTab;
  readonly ratingsTab: DocumentRatingsTab;

  constructor(page: Page) {
    super(page);
    this.actionTab = new ActionsTab(page);
    this.detailsTab = new DocumentDetailsTab(page);
    this.ratingsTab = new DocumentRatingsTab(page);
  }
}
