import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { BasePage } from './BasePage';
import { TableComponent } from './components/TableComponent';
import { ActionModal } from './modals/ActionModal';

export class ActionsRegisterPage extends BasePage {
  readonly addActionModal: ActionModal;
  readonly table: TableComponent;
  readonly addButton: Locator;

  constructor(page: Page) {
    super(page);
    this.table = new TableComponent(page);

    this.addButton = this.header.headerSection.getByRole('button', {
      name: 'Add Action',
    });
    this.addActionModal = new ActionModal(page);
  }

  private async navigateTo() {
    await this.navigation.click('Actions');
  }

  async navigateToAndAssertTitle() {
    await this.navigateTo();
    await expect(this.header.title).toHaveText(`Actions Register`);
  }
}
