import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';

export class ActionRequiresApprovalModal {
  readonly submitForApproval: Locator;
  readonly rationaleTextarea: Locator;

  constructor(parent: Page | Locator) {
    const page = 'page' in parent ? parent.page() : parent;
    this.submitForApproval = page.getByText('Submit for Approval');
    this.rationaleTextarea = page.getByPlaceholder(
      "Explain why you're requesting this change (optional)"
    );
  }

  async fillRationaleAndSubmit(rationale: string) {
    await this.rationaleTextarea.fill(rationale);
    await this.submitForApproval.click();
  }
}
