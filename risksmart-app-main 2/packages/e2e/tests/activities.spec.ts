import { expect } from '@playwright/test';

import { updateOrganisationFeatures } from '../apiClient';
import { test } from '../base';
import { users } from '../users';

[users.standard, users.riskManager].forEach((user) => {
  test.describe(`Created assessment activity name shown in register`, () => {
    test.use({ user });
    test(user.role, async ({ page, app }) => {
      await page.goto('/');
      const newAssessmentName = 'Assessment 1';

      await app.assessmentScenarios.createAssessment({
        title: newAssessmentName,
        summary: 'Assessment 1 summary text',
      });

      await app.assessmentDetailsPage.activitiesTab.selectTabAndAssertTitle(
        'Activities'
      );
      await app.assessmentDetailsPage.activitiesTab.actionMenu.openAndClickItem(
        'Add Activity'
      );

      const assessmentActivityForm =
        app.assessmentDetailsPage.activitiesTab.assessmentActivityForm;
      const newAssessmentActivityName = 'Assessment activity 1 title';
      await assessmentActivityForm.fillFormAndClickSave({
        title: newAssessmentActivityName,
        summary: 'Assessment activity 1 summary text',
      });
      await app.assessmentDetailsPage.notificationBanner.expectNotification(
        'Activity added successfully'
      );
      await app.assessmentDetailsPage.activitiesTab.table.expectRowCount(1);

      await app.assessmentDetailsPage.activitiesTab.table.expectRowToContain(
        1,
        {
          'Activity title': newAssessmentActivityName,
        }
      );
    });
  });
});

test('Validation shown when activity form is empty', async ({ page, app }) => {
  await page.goto('/');
  const newAssessmentName = 'Assessment 1';

  await app.assessmentScenarios.createAssessment({
    title: newAssessmentName,
    summary: 'Assessment 1 summary text',
  });

  await app.assessmentDetailsPage.activitiesTab.selectTab();
  await app.assessmentDetailsPage.activitiesTab.actionMenu.openAndClickItem(
    'Add Activity'
  );

  const assessmentActivityForm =
    app.assessmentDetailsPage.activitiesTab.assessmentActivityForm;
  await assessmentActivityForm.saveButton.click();

  const errors = await assessmentActivityForm.getErrors();
  expect(errors).toEqual({ summary: 'Required', title: 'Required' });
});

test('Can create and update an activity without a summary', async ({
  page,
  app,
}) => {
  await page.goto('/');
  const newAssessmentName = 'Assessment 1';

  await app.assessmentScenarios.createAssessment({
    title: newAssessmentName,
    summary: 'Assessment 1 summary text',
  });

  await app.assessmentDetailsPage.activitiesTab.selectTab();
  await app.assessmentDetailsPage.activitiesTab.actionMenu.openAndClickItem(
    'Add Activity'
  );

  const assessmentActivityForm =
    app.assessmentDetailsPage.activitiesTab.assessmentActivityForm;

  await assessmentActivityForm.formSettingsButton.openAndClickItem('Edit form');

  await app.customAttributeScenarios.editField(
    assessmentActivityForm.fields.summary,
    {
      required: false,
    }
  );

  await app.assessmentDetailsPage.assessmentForm.saveFormConfigurationButton.click();

  await assessmentActivityForm.saveButton.click();

  const errors = await assessmentActivityForm.getErrors();
  expect(errors).toEqual({ title: 'Required' });

  await assessmentActivityForm.fillFormAndClickSave({
    title: 'Activity without summary',
  });
  await app.assessmentDetailsPage.notificationBanner.expectNotification(
    'Activity added successfully'
  );
  await app.assessmentDetailsPage.activitiesTab.table.expectRowCount(1);
  await app.assessmentDetailsPage.activitiesTab.table.clickCellLink(
    'Activity title',
    1
  );
  await assessmentActivityForm.fillFormAndClickSave({
    title: 'updated title',
  });
  await app.assessmentDetailsPage.notificationBanner.expectNotification(
    'Activity updated successfully'
  );
});

test('Cannot set title, type or status as unrequired or add conditions', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['conditional_fields']);
  await page.goto('/');
  const newAssessmentName = 'Assessment 1';

  await app.assessmentScenarios.createAssessment({
    title: newAssessmentName,
    summary: 'Assessment 1 summary text',
  });

  await app.assessmentDetailsPage.activitiesTab.selectTab();
  await app.assessmentDetailsPage.activitiesTab.actionMenu.openAndClickItem(
    'Add Activity'
  );

  const form = app.assessmentDetailsPage.activitiesTab.assessmentActivityForm;
  const requiredFields = [
    form.fields.title,
    form.fields.activityType,
    form.fields.status,
  ];

  await form.formSettingsButton.openAndClickItem('Edit form');

  for (const field of requiredFields) {
    await field.editFieldButton.click();
    await expect(app.editFieldModal.header).toHaveText('Edit');
    await app.editFieldModal.editFieldForm.fields.conditions.expectIsVisible(
      false
    );
    await app.editFieldModal.editFieldForm.fields.required.expectToBeDisabled(
      true
    );
    await app.editFieldModal.editFieldForm.cancelButton.click();
  }
});

test('Can set sumary, activity user, completion date and attach files as unrequired', async ({
  app,
  page,
}) => {
  await page.goto('/');
  const newAssessmentName = 'Assessment 1';

  await app.assessmentScenarios.createAssessment({
    title: newAssessmentName,
    summary: 'Assessment 1 summary text',
  });

  await app.assessmentDetailsPage.activitiesTab.selectTab();
  await app.assessmentDetailsPage.activitiesTab.actionMenu.openAndClickItem(
    'Add Activity'
  );

  const form = app.assessmentDetailsPage.activitiesTab.assessmentActivityForm;

  await form.formSettingsButton.openAndClickItem('Edit form');

  const unrequiredFields = [
    form.fields.summary,
    form.fields.activityUser,
    form.fields.attachFiles,
    form.fields.completionDate,
  ];

  for (const field of unrequiredFields) {
    await app.customAttributeScenarios.editField(field, {
      required: false,
    });
  }
  await form.saveFormConfigurationButton.click();
  await form.fillFormAndClickSave({
    title: 'Title',
    activityType: 'Task',
    status: 'Not started',
  });
  await app.assessmentDetailsPage.notificationBanner.expectNotification(
    'Activity added successfully'
  );
});

test('Can add conditions on summary, activity user, completion date and attach files', async ({
  app,
  page,
}) => {
  await page.goto('/');
  await updateOrganisationFeatures(['conditional_fields']);
  const newAssessmentName = 'Assessment 1';

  await app.assessmentScenarios.createAssessment({
    title: newAssessmentName,
    summary: 'Assessment 1 summary text',
  });

  await app.assessmentDetailsPage.activitiesTab.selectTab();
  await app.assessmentDetailsPage.activitiesTab.actionMenu.openAndClickItem(
    'Add Activity'
  );

  const form = app.assessmentDetailsPage.activitiesTab.assessmentActivityForm;

  await form.formSettingsButton.openAndClickItem('Edit form');
  const conditionalFields = [
    form.fields.summary,
    form.fields.activityUser,
    form.fields.attachFiles,
    form.fields.completionDate,
  ];

  for (const field of conditionalFields) {
    await app.customAttributeScenarios.editField(field, {
      conditions: 'Activity title=test',
    });
  }
  await form.saveFormConfigurationButton.click();

  for (const field of conditionalFields) {
    await field.expectIsVisible(false);
  }

  await form.fillForm({
    title: 'test',
  });
  for (const field of conditionalFields) {
    await field.expectIsVisible(true);
  }

  await form.fillFormAndClickSave({
    title: 'Title',
    activityType: 'Task',
    status: 'Not started',
  });
  await app.assessmentDetailsPage.notificationBanner.expectNotification(
    'Activity added successfully'
  );
});
