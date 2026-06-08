import { expect } from '@playwright/test';

import { updateOrganisationFeatures } from '../apiClient';
import { test } from '../base';
import type { CustomisableField } from '../models/forms/fields/CustomisableField';
import { users } from '../users';

test('Created internal audit name shown in details page header', async ({
  app,
  page,
}) => {
  const newInternalAuditName = 'Internal audit 1';
  await updateOrganisationFeatures(['internal_audit']);
  await page.goto('/');

  await app.internalAuditScenarios.createInternalAudit({
    title: newInternalAuditName,
    description: 'Internal Audit  1 summary text',
    businessArea: 'Technology',
  });

  await expect(app.internalAuditDetailsPage.header.title).toHaveText(
    newInternalAuditName
  );
});

test('Created internal audit name shown in register', async ({ app, page }) => {
  const newInternalAuditName = 'Internal Audit 1';
  await updateOrganisationFeatures(['internal_audit']);
  await page.goto('/');

  await app.internalAuditScenarios.createInternalAudit({
    title: newInternalAuditName,
    description: 'Internal Audit  1 summary text',
    businessArea: 'Technology',
  });
  await app.addInternalAuditPage.internalAuditForm.cancelButton.click();
  await expect(app.internalAuditRegisterPage.header.count).toHaveText(`(1)`);
  await expect(
    await app.internalAuditRegisterPage.table.getBodyCell('Title', 1)
  ).toHaveText(newInternalAuditName);
});

test('Deleted internal audit not shown in internal audit register', async ({
  app,
  page,
}) => {
  const newInternalAuditName = 'Internal audit 1';
  await updateOrganisationFeatures(['internal_audit']);
  await page.goto('/');

  await app.internalAuditScenarios.createInternalAudit({
    title: newInternalAuditName,
    description: 'Internal Audit  1 summary text',
    businessArea: 'Technology',
  });

  await app.internalAuditDetailsPage.deleteButton.click();
  await app.internalAuditDetailsPage.deleteModal.confirmButton.click();
  await app.internalAuditRegisterPage.notificationBanner.expectNotification(
    'Internal audit deleted successfully'
  );

  await expect(app.internalAuditRegisterPage.header.title).toHaveText(
    'Internal Audits Register',
    {
      timeout: 10000,
    }
  );

  await expect(
    page.locator(
      app.internalAuditRegisterPage.table.tableWrapper
        .findLoadingText()
        .toSelector()
    )
  ).toHaveCount(0);

  await expect(app.internalAuditRegisterPage.header.count).toHaveText(`(0)`);
});

test('Cannot set title, business area or owners as unrequired or add conditions', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['conditional_fields', 'internal_audit']);
  await page.goto('/');
  await app.internalAuditScenarios.navigateToAddInternalAuditPage();

  const form = app.addInternalAuditPage.internalAuditForm;
  const requiredFields = [
    form.fields.title,
    form.fields.businessArea,
    form.fields.owners,
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

test('Can set description, contributor, departments and tags as unrequired', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['internal_audit']);
  await page.goto('/');
  await app.internalAuditScenarios.navigateToAddInternalAuditPage();

  const form = app.addInternalAuditPage.internalAuditForm;

  const unrequiredFields = [
    form.fields.description,
    form.fields.contributors,
    form.fields.departments,
    form.fields.tags,
  ];

  await form.formSettingsButton.openAndClickItem('Edit form');

  for (const field of unrequiredFields) {
    await app.customAttributeScenarios.editField(field, {
      required: false,
    });
  }
  await form.saveFormConfigurationButton.click();
  await form.fillFormAndClickSave({
    title: 'Title',
    businessArea: 'Business area 1',
    owners: [users.riskManager.friendlyName],
  });
  await app.internalAuditDetailsPage.notificationBanner.expectNotification(
    'Internal audit added successfully'
  );
});

test('Can add conditions on description, contributor, departments and tags', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['conditional_fields', 'internal_audit']);
  await page.goto('/');
  await app.internalAuditScenarios.navigateToAddInternalAuditPage();

  const form = app.addInternalAuditPage.internalAuditForm;

  const conditionalFields = [
    form.fields.description,
    form.fields.contributors,
    form.fields.departments,
    form.fields.tags,
  ];

  await form.formSettingsButton.openAndClickItem('Edit form');

  for (const field of conditionalFields) {
    await app.customAttributeScenarios.editField(field, {
      conditions: 'Title=test',
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
    businessArea: 'Business area 1',
    owners: [users.riskManager.friendlyName],
  });
  await app.internalAuditDetailsPage.notificationBanner.expectNotification(
    'Internal audit added successfully'
  );
});

test('Updated internal audit field names shown in register', async ({
  page,
  app,
}) => {
  test.slow();
  await updateOrganisationFeatures(['internal_audit']);
  await page.goto('/');

  await app.internalAuditScenarios.navigateToAddInternalAuditPage();

  const form = app.addInternalAuditPage.internalAuditForm;

  await form.formSettingsButton.openAndClickItem('Edit form');

  const fieldsToRename: {
    field: CustomisableField;
    newLabel: string;
    notInRegister?: boolean;
  }[] = [
    {
      field: form.fields.title,
      newLabel: 'New title',
    },
    {
      field: form.fields.description,
      newLabel: 'New description',
      notInRegister: true,
    },
    {
      field: form.fields.businessArea,
      newLabel: 'New business area',
    },
    {
      field: form.fields.owners,
      newLabel: 'New owners',
    },
    {
      field: form.fields.contributors,
      newLabel: 'New contributors',
    },
    {
      field: form.fields.tags,
      newLabel: 'New tags',
    },
    {
      field: form.fields.departments,
      newLabel: 'New departments',
    },
  ];

  for (const { field, newLabel } of fieldsToRename) {
    await app.customAttributeScenarios.editField(field, {
      enableCustomLabel: true,
      label: newLabel,
    });
  }

  await form.saveFormConfigurationButton.click();

  await form.fillFormAndClickSave({
    title: 'a',
    businessArea: 'b',
    owners: [users.riskManager.friendlyName],
  });
  await app.internalAuditDetailsPage.notificationBanner.expectNotification(
    'Internal audit added successfully'
  );

  await app.internalAuditRegisterPage.navigateToAndAssertTitle();
  await app.internalAuditRegisterPage.table.expectRowCount(1);
  await app.internalAuditRegisterPage.table.toggleVisibleColumns(
    fieldsToRename.filter((f) => !f.notInRegister).map((f) => f.newLabel)
  );
  await app.internalAuditRegisterPage.table.expectRowToContain(1, {
    'New contributors': '',
    'New departments': '',
    'New tags': '',
    'New owners': ['RiskManager1'],
    'New title': 'a',
  });
});
