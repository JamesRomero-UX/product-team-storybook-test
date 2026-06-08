import type { Page } from '@playwright/test';

import { Tab } from './Tab';

export class InternalAuditActionsTab extends Tab {
  constructor(page: Page) {
    super(page, 'actions');
  }
}
