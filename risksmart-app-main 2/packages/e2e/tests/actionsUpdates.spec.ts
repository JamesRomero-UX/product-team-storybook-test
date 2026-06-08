import { test } from '../base';
import { buildActionFormValues } from '../testData/actionFormValuesBuilder';

test('Can add an action update', async ({ page, app }) => {
  await page.goto('/');

  const action = buildActionFormValues({
    title: 'Action for adding update',
    description: 'This is an action to test adding an update',
    dateRaised: '2023-01-01',
  });
  await app.actionScenarios.createActionFromRegister(action);
  await app.actionsRegisterPage.table.clickCellLink('Action title', 1);
  await app.actionDetailsPage.actionUpdatesTab.selectTabAndAssertTitle(
    'Updates'
  );
  await app.actionDetailsPage.actionUpdatesTab.addButton.click();
  await app.actionDetailsPage.actionUpdatesTab.actionUpdateForm.fillFormAndClickSave(
    {
      title: 'First action update',
      description: 'This is the first action update',
      attachFiles: [__dirname + '/testFiles/testFile.txt'],
    }
  );
  await app.actionDetailsPage.notificationBanner.expectNotification(
    'Update added successfully'
  );

  await app.actionDetailsPage.actionUpdatesTab.table.expectRowCount(1);
});
