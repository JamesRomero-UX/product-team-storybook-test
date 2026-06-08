import { expect } from '@playwright/test';

import { updateOrganisationFeatures } from '../apiClient';
import { test } from '../base';
import { buildAssessmentFormValues } from '../testData/assessmentFormValuesBuilder';
import { buildRiskFormValues } from '../testData/riskFormValuesBuilder';
import { users } from '../users';

test('Can start an RCSA for a risk', async ({ page, app }) => {
  await updateOrganisationFeatures(['wizard']);
  await page.goto('/');
  const assessment = buildAssessmentFormValues({});
  await app.assessmentScenarios.createAssessment(assessment);
  await app.riskScenarios.createRisk(
    buildRiskFormValues({
      // must be an owner to start an RCSA
      owners: [users.riskManager.friendlyName],
    })
  );
  await app.riskDetailsPage.startRCSAButton.click();
  await app.riskDetailsPage.linkToAnAssessmentModal.linkedToAnAssessmentForm.fillFormAndClickSave(
    {
      assessment: assessment.title,
    }
  );
  await app.riskDetailsPage.notificationBanner.expectNotification(
    'Assessment updated successfully'
  );
  await expect(app.riskDetailsPage.helpPanel.header).toHaveText('RCSA Wizard');
});

test('Can delete an assessment associated with an RCSA', async ({
  page,
  app,
}) => {
  await updateOrganisationFeatures(['wizard']);
  await page.goto('/');
  const assessment = buildAssessmentFormValues({});
  await app.assessmentScenarios.createAssessment(assessment);
  await app.riskScenarios.createRisk(
    buildRiskFormValues({
      // must be an owner to start an RCSA
      owners: [users.riskManager.friendlyName],
    })
  );
  await app.riskDetailsPage.startRCSAButton.click();
  await app.riskDetailsPage.linkToAnAssessmentModal.linkedToAnAssessmentForm.fillFormAndClickSave(
    {
      assessment: assessment.title,
    }
  );
  await app.riskDetailsPage.notificationBanner.expectNotification(
    'Assessment updated successfully'
  );
  await expect(app.riskDetailsPage.helpPanel.header).toHaveText('RCSA Wizard');

  await app.assessmentRegisterPage.navigateToAndAssertTitle();
  await app.assessmentRegisterPage.table.expectRowCount(1);
  await app.assessmentRegisterPage.table.clickCellLink('Title', 1);

  await app.assessmentDetailsPage.actionsButton.openAndClickItem(
    'Delete Assessment'
  );
  await expect(
    app.assessmentDetailsPage.deleteModal.modalContent
  ).toContainText(
    'Deleting this Assessment will delete any in-progress RCSA Activities linked to Risks. This action cannot be undone.'
  );
  await app.assessmentDetailsPage.deleteModal.confirmButton.click();
  await app.assessmentDetailsPage.notificationBanner.expectNotification(
    'Assessment deleted successfully'
  );
});
