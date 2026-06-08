import { expect } from '@playwright/test';

import { test } from '../base';

test(`Saving issue update`, async ({ app, page }) => {
  await page.goto('/');
  const issueTitle = 'Issue 1';
  await app.issueScenarios.createIssue({
    title: issueTitle,
    details: 'Issue description 1',
    dateIdentified: '2020-01-01',
    dateOccurred: '2020-01-01',
  });

  await app.issueRegisterPage.table.clickCellLink('Title', 1);

  await expect(app.issueDetailsPage.header.title).toHaveText(issueTitle);

  await app.issueDetailsPage.issueUpdateTab.selectTabAndAssertTitle('Updates');
  await app.issueDetailsPage.issueUpdateTab.addButton.click();
  const issueUpdateTitle = 'Update 1';
  await app.issueDetailsPage.issueUpdateTab.issueUpdateForm.fillFormAndClickSave(
    {
      title: 'Update 1',
      description: 'Update description 1',
      attachFiles: [__dirname + '/testFiles/testFile.txt'],
    }
  );

  await app.issueDetailsPage.notificationBanner.expectNotification(
    'Update added successfully'
  );

  await app.issueDetailsPage.issueUpdateTab.table.expectRowCount(1);

  await app.issueDetailsPage.issueUpdateTab.table.expectRowToContain(1, {
    Title: issueUpdateTitle,
    Description: 'Update description 1',
  });

  await app.issueDetailsPage.issueUpdateTab.table.clickCellLink('Title', 1);
  await app.issueDetailsPage.issueUpdateTab.issueUpdateForm.expectValues({
    title: 'Update 1',
    description: 'Update description 1',
    attachFiles: ['testFile.txt'],
  });
});
