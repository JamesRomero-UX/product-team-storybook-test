import { updateOrganisationFeatures } from '../apiClient';
import { test } from '../base';
import { buildDocumentFormValues } from '../testData/documentFormValuesBuilder';

test('Policy register shows correct Version status and Review status for a new draft document', async ({
  page,
  app,
}) => {
  await updateOrganisationFeatures(['policy']);
  await page.goto('/');

  await app.policyScenarios.createDocument(
    buildDocumentFormValues({
      title: 'Status Split Test Policy',
      purpose: 'Validate status columns after split',
    })
  );

  await app.policyScenarios.navigateToAddVersionFromDocumentDetails();
  await app.documentVersionPage.detailsTab.form.fillFormAndClickSave({
    versionNumber: '1.0',
    summary: 'Initial draft',
    type: 'Link',
    link: 'http://www.example.com',
  });
  await app.documentVersionPage.notificationBanner.expectNotification(
    'Version added successfully'
  );

  await app.policyRegisterPage.navigateToAndAssertTitle();
  await app.policyRegisterPage.table.expectRowCount(1);
  await app.policyRegisterPage.table.expectRowToContain(1, {
    'Version status': 'Draft',
    'Review status': '–',
  });
});
