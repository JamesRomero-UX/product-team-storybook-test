import type { Page } from '@playwright/test';

import { DocumentPage } from './DocumentPage';
import { VersionTab } from './tabs/VersionTab';

export class DocumentDetailsPage extends DocumentPage {
  readonly versionTab: VersionTab;
  constructor(page: Page) {
    super(page);

    this.versionTab = new VersionTab(page);
  }
}
