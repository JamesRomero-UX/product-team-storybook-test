import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import type { GroupFormFields } from '../models/forms/GroupForm';
import { GroupPage } from '../models/GroupPage';
import { SettingsPage } from '../models/SettingsPage';

export class GroupScenarios {
  readonly page: Page;
  readonly settingsPage: SettingsPage;
  readonly groupPage: GroupPage;

  constructor(page: Page) {
    this.page = page;
    this.settingsPage = new SettingsPage(page);
    this.groupPage = new GroupPage(page);
  }

  /**
   * Creates a group
   *
   * @param groupForm
   */
  async createGroupWithUsers(
    groupForm: Partial<GroupFormFields>,
    users: string[]
  ) {
    const settingsPage = new SettingsPage(this.page);
    await settingsPage.navigateToAndAssertTitle();

    await settingsPage.groupsTab.selectTabAndAssertTitle('Groups');

    const groupRowCount = await settingsPage.groupsTab.table.getRowCount();
    await settingsPage.groupsTab.addButton.click();
    await settingsPage.groupsTab.addGroupModal.groupForm.fillFormAndClickSave(
      groupForm
    );

    await settingsPage.notificationBanner.expectNotification(
      'Group added successfully'
    );
    await settingsPage.groupsTab.table.expectRowCount(1);
    await settingsPage.groupsTab.table.clickCellText(
      'Name',
      1,
      groupForm.name!
    );

    const groupPage = new GroupPage(this.page);
    await expect(groupPage.header.title).toHaveText(groupForm.name!);
    await groupPage.groupMembersTab.selectTabAndAssertTitle('Members');
    await groupPage.groupMembersTab.addButton.click();
    await groupPage.groupMembersTab.addUsersModal.addUsersForm.fillFormAndClickSave(
      {
        users,
      }
    );
    await groupPage.notificationBanner.expectNotification(
      'Member added successfully'
    );
    await groupPage.groupMembersTab.table.expectRowCount(users.length);

    await settingsPage.navigateToAndAssertTitle();
    await settingsPage.groupsTab.selectTabAndAssertTitle('Groups');
    await settingsPage.groupsTab.table.expectRowCount(groupRowCount + 1);
  }
}
