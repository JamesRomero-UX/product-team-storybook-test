import type { Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { DocumentVersionDetailsTab } from './tabs/DocumentVersionDetailsTab';

export class DocumentVersionPage extends BasePage {
  readonly detailsTab: DocumentVersionDetailsTab;
  constructor(page: Page) {
    super(page);

    this.detailsTab = new DocumentVersionDetailsTab(page);
  }
}
