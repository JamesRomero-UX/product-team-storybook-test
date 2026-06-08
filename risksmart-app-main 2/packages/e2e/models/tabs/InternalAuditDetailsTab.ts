import type { Page } from '@playwright/test';

import { Tab } from './Tab';

export class InternalAuditDetailsTab extends Tab {
  constructor(page: Page) {
    super(page, 'details');
  }
}
