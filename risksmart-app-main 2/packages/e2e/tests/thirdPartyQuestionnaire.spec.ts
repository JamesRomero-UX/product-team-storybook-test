import { updateOrganisationFeatures } from '../apiClient';
import { test } from '../base';

test(`Can navigate to the questionnaire register`, async ({ page, app }) => {
  await updateOrganisationFeatures(['third_party']);
  await page.goto('/');

  await app.questionnaireRegister.navigateToAndAssertTitle();
});

test(`Can add a questionnaire`, async ({ page, app }) => {
  await updateOrganisationFeatures(['third_party']);
  await page.goto('/');

  await app.thirdPartyQuestionnaireScenarios.createThirdPartyQuestionnaire({
    title: 'Questionnaire 1',
    owners: ['RiskManager1'],
  });
  await app.questionnaireRegister.navigateToAndAssertTitle();
  await app.questionnaireRegister.table.expectRowCount(1);
  await app.questionnaireRegister.table.expectRowToContain(1, {
    Title: 'Questionnaire 1',
  });
});

test(`Can delete a questionnaire`, async ({ page, app }) => {
  await updateOrganisationFeatures(['third_party']);
  await page.goto('/');

  await app.thirdPartyQuestionnaireScenarios.createThirdPartyQuestionnaire({
    title: 'Questionnaire 1',
    owners: ['RiskManager1'],
  });

  await app.questionnaireVersionDetailsPage.detailsTab.questionnaireVersionForm.cancelButton.click();
  await app.questionnaireVersionDetailsPage.detailsTab.questionnaireVersionForm.confirmModal.confirmButton.click();

  await app.questionnaireDetailsPage.deleteButton.click();

  await app.questionnaireDetailsPage.deleteModal.confirmButton.click();
  await app.questionnaireDetailsPage.notificationBanner.expectNotification(
    'Questionnaire deleted successfully'
  );
});
