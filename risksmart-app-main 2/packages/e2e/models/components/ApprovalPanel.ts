import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';

import { HelpPanel } from '../HelpPanel';

export class ApprovalPanel extends HelpPanel {
  readonly approveButton: Locator;

  constructor(page: Page | Locator) {
    super(page);
    this.approveButton = page.getByRole('button', { name: 'Approve' });
  }

  async approve() {
    await this.approveButton.click();
  }
}
