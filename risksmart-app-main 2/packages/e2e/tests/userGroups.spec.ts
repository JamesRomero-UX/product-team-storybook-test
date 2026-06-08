import { expect } from '@playwright/test';

import { test } from '../base';

test(`Displays user group in register`, async ({ app, page }) => {
  await page.goto('/');
  await app.settingsPage.navigateToAndAssertTitle();

  await app.settingsPage.groupsTab.selectTabAndAssertTitle('Groups');

  await app.settingsPage.groupsTab.table.expectRowCount(0);
  await app.settingsPage.groupsTab.addButton.click();
  await app.settingsPage.groupsTab.addGroupModal.groupForm.fillFormAndClickSave(
    {
      name: 'User Group 1',
      description: 'User Group Description 1',
      ownerContributor: 'Yes',
    }
  );

  await app.settingsPage.notificationBanner.expectNotification(
    'Group added successfully'
  );
  await app.settingsPage.groupsTab.table.expectRowCount(1);
  const row = await app.settingsPage.groupsTab.table.getRowAsObject(1);
  expect(row).toEqual(
    expect.objectContaining({
      Description: 'User Group Description 1',
      'Email address': '–',
      Members: '0',
      Name: 'User Group 1',
    })
  );
});

test(`Add group members`, async ({ app, page }) => {
  await page.goto('/');
  await app.settingsPage.navigateToAndAssertTitle();

  await app.settingsPage.groupsTab.selectTabAndAssertTitle('Groups');

  await app.settingsPage.groupsTab.table.expectRowCount(0);
  await app.settingsPage.groupsTab.addButton.click();
  await app.settingsPage.groupsTab.addGroupModal.groupForm.fillFormAndClickSave(
    {
      name: 'User Group 1',
      description: 'User Group Description 1',
      ownerContributor: 'Yes',
    }
  );
  await app.settingsPage.notificationBanner.expectNotification(
    'Group added successfully'
  );
  await app.settingsPage.groupsTab.table.expectRowCount(1);
  await (await app.settingsPage.groupsTab.table.getBodyCell('Name', 1)).click();

  await expect(app.groupPage.header.title).toHaveText('User Group 1');
  await app.groupPage.groupMembersTab.selectTabAndAssertTitle('Members');
  await app.groupPage.groupMembersTab.addButton.click();
  await app.groupPage.groupMembersTab.addUsersModal.addUsersForm.fillFormAndClickSave(
    {
      users: ['RiskManager1'],
    }
  );

  await app.groupPage.notificationBanner.expectNotification(
    'Member added successfully'
  );
  await app.groupPage.groupMembersTab.table.expectRowCount(1);
  const row = await app.groupPage.groupMembersTab.table.getRowAsObject(1);
  expect(row).toEqual(
    expect.objectContaining({
      Email: 'user1@user.com',
      Username: 'RiskManager1',
    })
  );

  await app.settingsPage.navigateToAndAssertTitle();
  await app.settingsPage.groupsTab.selectTabAndAssertTitle('Groups');
  await app.settingsPage.groupsTab.table.expectRowCount(1);
  const groupRow = await app.settingsPage.groupsTab.table.getRowAsObject(1);
  expect(groupRow).toEqual(
    expect.objectContaining({
      Description: 'User Group Description 1',
      'Email address': '–',
      Members: '1',
      Name: 'User Group 1',
    })
  );
});
