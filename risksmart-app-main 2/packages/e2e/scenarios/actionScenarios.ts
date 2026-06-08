import type { Page } from '@playwright/test';

import { ActionsRegisterPage } from '../models/ActionsRegisterPage';
import type { ActionFormFields } from '../models/forms/ActionForm';
import { NotificationBanner } from '../models/NotificationBanner';
import type { ActionsTab } from '../models/tabs/ActionsTab';

export class ActionScenarios {
  readonly page: Page;
  readonly actionsRegisterPage: ActionsRegisterPage;

  constructor(page: Page) {
    this.page = page;
    this.actionsRegisterPage = new ActionsRegisterPage(page);
  }

  /**
   * Create an action from a tab e.g. risk action tab
   *
   * @param actionsTab
   * @param action
   */
  async createActionFromActionTab(
    actionsTab: ActionsTab,
    action: Partial<ActionFormFields>
  ) {
    const rowCount = await actionsTab.table.getRowCount();
    await actionsTab.addButton.click();

    await actionsTab.addActionModal.actionForm.fillFormAndClickSave(action);
    const notificationBanner = new NotificationBanner(this.page);
    await notificationBanner.expectNotification('Action added successfully');
    await actionsTab.table.expectRowCount(rowCount + 1);
  }

  /**
   * Creates an action
   *
   * @param action
   */
  async createActionFromRegister(action: Partial<ActionFormFields>) {
    await this.actionsRegisterPage.navigateToAndAssertTitle();
    const rowCount = await this.actionsRegisterPage.table.getRowCount();

    await this.actionsRegisterPage.addButton.click();
    await this.actionsRegisterPage.addActionModal.actionForm.fillFormAndClickSave(
      action
    );
    await this.actionsRegisterPage.notificationBanner.expectNotification(
      'Action added successfully'
    );
    await this.actionsRegisterPage.table.expectRowCount(rowCount + 1);
  }
}
