import { test } from '../base';

test(`Can create a new department`, async ({ page, app }) => {
  await page.goto('/');
  await app.settingsPage.navigateToAndAssertTitle();
  await app.settingsPage.departmentsTab.selectTabAndAssertTitle('Departments');
  await app.settingsPage.departmentsTab.table.expectRowCount(0);
  await app.settingsPage.departmentsTab.addButton.click();
  await app.settingsPage.departmentsTab.addDepartmentModal.departmentForm.fillFormAndClickSave(
    {
      name: 'Test Department',
      description: 'This is a test department',
    }
  );

  await app.settingsPage.notificationBanner.expectNotification(
    'Department added successfully'
  );

  await app.settingsPage.departmentsTab.table.expectRowCount(1);
  await app.settingsPage.departmentsTab.table.expectRowToContain(1, {
    Name: 'Test Department',
    Description: 'This is a test department',
  });
});

test(`Can update a department`, async ({ page, app }) => {
  await page.goto('/');
  await app.settingsPage.navigateToAndAssertTitle();
  await app.settingsPage.departmentsTab.selectTabAndAssertTitle('Departments');
  await app.settingsPage.departmentsTab.table.expectRowCount(0);
  await app.settingsPage.departmentsTab.addButton.click();
  await app.settingsPage.departmentsTab.addDepartmentModal.departmentForm.fillFormAndClickSave(
    {
      name: 'Test Department',
      description: 'This is a test department',
    }
  );

  await app.settingsPage.notificationBanner.expectNotification(
    'Department added successfully'
  );

  await app.settingsPage.departmentsTab.table.expectRowCount(1);

  await app.settingsPage.departmentsTab.table.clickCellLink('Name', 1);
  await app.settingsPage.departmentsTab.addDepartmentModal.departmentForm.fillFormAndClickSave(
    {
      name: 'Updated Department',
      description: 'This is an updated test department',
    }
  );

  await app.settingsPage.notificationBanner.expectNotification(
    'Department updated successfully'
  );

  await app.settingsPage.departmentsTab.table.expectRowToContain(1, {
    Name: 'Updated Department',
    Description: 'This is an updated test department',
  });
});

test(`Can delete a department`, async ({ page, app }) => {
  await page.goto('/');
  await app.settingsPage.navigateToAndAssertTitle();
  await app.settingsPage.departmentsTab.selectTabAndAssertTitle('Departments');
  await app.settingsPage.departmentsTab.table.expectRowCount(0);
  await app.settingsPage.departmentsTab.addButton.click();
  await app.settingsPage.departmentsTab.addDepartmentModal.departmentForm.fillFormAndClickSave(
    {
      name: 'Test Department',
      description: 'This is a test department',
    }
  );

  await app.settingsPage.notificationBanner.expectNotification(
    'Department added successfully'
  );

  await app.settingsPage.departmentsTab.table.expectRowCount(1);
  await app.settingsPage.departmentsTab.table.checkRow(1);
  await app.settingsPage.departmentsTab.deleteButton.click();
  await app.settingsPage.departmentsTab.deleteModal.confirmButton.click();
  await app.settingsPage.notificationBanner.expectNotification(
    'Department deleted successfully'
  );
  await app.settingsPage.departmentsTab.table.expectRowCount(0);
});
