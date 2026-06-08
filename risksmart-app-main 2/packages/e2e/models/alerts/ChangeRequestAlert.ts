import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';

import { BaseAlert } from './BaseAlert';

export class ChangeRequestAlert extends BaseAlert {
  readonly showPendingChangesButton: Locator;
  readonly showDeleteRequestButton: Locator;
  readonly viewCurrentButton: Locator;

  constructor(page: Page | Locator) {
    super(page, 'change-request-alert');
    this.showPendingChangesButton = this.page.getByRole('button', {
      name: 'Show Pending Changes',
    });
    this.showDeleteRequestButton = this.page.getByRole('button', {
      name: 'Show Delete Request',
    });
    this.viewCurrentButton = this.page.getByRole('button', {
      name: 'View Current',
    });
  }
}
