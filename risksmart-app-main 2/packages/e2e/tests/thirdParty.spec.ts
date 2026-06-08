import { expect } from '@playwright/test';

import {
  insertDepartmentTypes,
  insertTagTypes,
  updateOrganisationFeatures,
} from '../apiClient';
import { test } from '../base';
import type { ThirdPartyFormValues } from '../models/forms/ThirdPartyForm';
import { buildThirdPartyFormValues } from '../testData/thirdPartyFormValuesBuilder';
import { users } from '../users';

test('Validation error shown when creating a empty third party', async ({
  page,
  app,
}) => {
  await updateOrganisationFeatures(['third_party']);
  await page.goto('/');

  await app.thirdPartyScenarios.navigateToAddThirdPartyPage();
  await app.thirdPartyDetails.detailsTab.thirdPartyForm.saveButton.click();
  const errors =
    await app.thirdPartyDetails.detailsTab.thirdPartyForm.getErrors();
  expect(errors).toEqual({
    owners: 'Required',
    status: 'Required',
    title: 'Required',
    type: 'Required',
  });
});

test(`Can add a third party with custom attributes`, async ({ page, app }) => {
  await updateOrganisationFeatures(['third_party']);
  await insertTagTypes([
    { Name: 'Tag 1', Description: 'Tag 1 description' },
    { Name: 'Tag 2', Description: 'Tag 2 description' },
  ]);
  await insertDepartmentTypes([
    { Name: 'Department 1', Description: 'Department 1 description' },
    { Name: 'Department 2', Description: 'Department 2 description' },
  ]);

  await page.goto('/');

  await app.thirdPartyScenarios.navigateToAddThirdPartyPage();
  await app.customAttributeScenarios.addCustomAttribute(
    app.thirdPartyDetails.detailsTab.thirdPartyForm,
    {
      fieldType: 'Text',
      label: 'Custom Text Field',
    }
  );

  const thirdParty = buildThirdPartyFormValues({
    attachFiles: [__dirname + '/testFiles/testFile.txt'],
    tags: ['Tag 1', 'Tag 2'],
    departments: ['Department 1', 'Department 2'],
  });
  await app.thirdPartyScenarios.createThirdParty(thirdParty, [
    {
      type: 'Text',
      label: 'Custom Text Field',
      value: 'Custom Text Field Value',
    },
  ]);

  await app.thirdPartyRegisterPage.navigateToAndAssertTitle();
  await app.thirdPartyRegisterPage.table.expectRowCount(1);
  await app.thirdPartyRegisterPage.table.toggleAllColumnsToBeVisible();
  await app.thirdPartyRegisterPage.table.expectRowToContain(1, {
    Title: thirdParty.title,
    Description: thirdParty.description,
    'Contact Name': thirdParty.contactName,
    'Companies House Number': thirdParty.companiesHouseNumber,
    Address: thirdParty.address,
    'City/Town': thirdParty.city,
    Postcode: thirdParty.postcode,
    Country: thirdParty.country,
    'Primary Contact Name': thirdParty.primaryContactName,
    'Company Domain': thirdParty.companyDomain,
    'Contact Email': thirdParty.email,
    'Company Name': thirdParty.companyName,
    Type: thirdParty.type,
    Status: thirdParty.status,
    Criticality: thirdParty.criticality,
  });

  await app.thirdPartyRegisterPage.table.clickCellLink('Title', 1);

  await app.thirdPartyDetails.detailsTab.thirdPartyForm.expectValues({
    ...thirdParty,
    attachFiles: ['testFile.txt'],
  });
});

test(`Can update a third party with custom attributes`, async ({
  page,
  app,
}) => {
  await updateOrganisationFeatures(['third_party']);
  await page.goto('/');

  await app.thirdPartyScenarios.navigateToAddThirdPartyPage();
  await app.customAttributeScenarios.addCustomAttribute(
    app.thirdPartyDetails.detailsTab.thirdPartyForm,
    {
      fieldType: 'Text',
      label: 'Custom Text Field',
    }
  );

  const thirdParty = buildThirdPartyFormValues();
  await app.thirdPartyScenarios.createThirdParty(thirdParty, [
    {
      type: 'Text',
      label: 'Custom Text Field',
      value: 'Custom Text Field Value',
    },
  ]);

  const updatedThirdParty: ThirdPartyFormValues = {
    title: 'Updated Third Party Title',
    companyName: 'Updated Company Name ',
    type: 'Supplier',
    status: 'Active',
    criticality: 'Moderate',
    owners: ['Standard1'],
    description: 'Updated Third Party Description',
    companiesHouseNumber: 'Updated Companies House Number',
    primaryContactName: 'Updated Primary Contact Name',
    address: 'Updated Address',
    city: 'Updated City',
    postcode: 'Updated Postcode',
    country: 'Updated Country',
    email: 'Updated Email',
    companyDomain: 'Updated Company Domain',
    contactName: 'Updated Contact Name',
    contributors: ['RiskManager1'],
    tags: [],
    departments: [],
    attachFiles: [],
  };

  await app.thirdPartyDetails.detailsTab.thirdPartyForm.fillFormAndClickSave(
    updatedThirdParty,
    [
      {
        type: 'Text',
        label: 'Custom Text Field',
        value: 'Updated Custom Text Field Value',
      },
    ]
  );

  await app.thirdPartyDetails.notificationBanner.expectNotification(
    'Third party updated successfully'
  );

  await app.thirdPartyRegisterPage.navigateToAndAssertTitle();
  await app.thirdPartyRegisterPage.table.expectRowCount(1);
  await app.thirdPartyRegisterPage.table.toggleAllColumnsToBeVisible();
  await app.thirdPartyRegisterPage.table.expectRowToContain(1, {
    Title: updatedThirdParty.title,
    Description: updatedThirdParty.description,
    'Contact Name': updatedThirdParty.contactName,
    'Companies House Number': updatedThirdParty.companiesHouseNumber,
    Address: updatedThirdParty.address,
    'City/Town': updatedThirdParty.city,
    Postcode: updatedThirdParty.postcode,
    Country: updatedThirdParty.country,
    'Primary Contact Name': updatedThirdParty.primaryContactName,
    'Company Domain': updatedThirdParty.companyDomain,
    'Contact Email': updatedThirdParty.email,
    'Company Name': updatedThirdParty.companyName,
    Type: updatedThirdParty.type,
    Status: updatedThirdParty.status,
    Criticality: updatedThirdParty.criticality,
    'Custom Text Field': 'Updated Custom Text Field Value',
  });

  await app.thirdPartyRegisterPage.table.clickCellLink('Title', 1);
  await app.thirdPartyDetails.detailsTab.thirdPartyForm.expectValues(
    updatedThirdParty
  );
});

test(`Can delete a third party`, async ({ page, app }) => {
  await updateOrganisationFeatures(['third_party']);
  await page.goto('/');
  const thirdParty = buildThirdPartyFormValues();
  await app.thirdPartyScenarios.createThirdParty(thirdParty);

  await app.thirdPartyDetails.deleteButton.click();
  await app.thirdPartyDetails.deleteModal.confirmButton.click();
  await app.thirdPartyDetails.notificationBanner.expectNotification(
    'Third party deleted successfully'
  );
  await app.thirdPartyRegisterPage.navigateToAndAssertTitle();
  await app.thirdPartyRegisterPage.table.expectRowCount(0);
});

test('Cannot set title, type, status, owner as unrequired or add conditions', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['conditional_fields', 'third_party']);
  await page.goto('/');
  await app.thirdPartyScenarios.navigateToAddThirdPartyPage();

  const form = app.thirdPartyDetails.detailsTab.thirdPartyForm;
  const requiredFields = [
    form.fields.title,
    form.fields.type,
    form.fields.status,
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

test('Can set company name, criticality, description, companies house number, address, city, primary contact name, contact name, email, companyDomain, contributors, tags, departments and attach files as unrequired', async ({
  app,
  page,
}) => {
  test.slow();
  await updateOrganisationFeatures(['conditional_fields', 'third_party']);
  await page.goto('/');
  await app.thirdPartyScenarios.navigateToAddThirdPartyPage();

  const form = app.thirdPartyDetails.detailsTab.thirdPartyForm;
  const unrequiredFields = [
    form.fields.companyName,
    form.fields.criticality,
    form.fields.description,
    form.fields.companiesHouseNumber,
    form.fields.address,
    form.fields.city,
    form.fields.postcode,
    form.fields.country,
    form.fields.primaryContactName,
    form.fields.contactName,
    form.fields.email,
    form.fields.companyDomain,
    form.fields.contributors,
    form.fields.tags,
    form.fields.departments,
    form.fields.attachFiles,
  ];

  await app.customAttributeScenarios.bulkEditFields(form, [
    ...unrequiredFields.map((field) => ({
      field,
      values: { required: false },
    })),
  ]);

  await form.fillFormAndClickSave({
    title: 'Title',
    type: 'Consultant',
    status: 'Active',
    owners: [users.riskManager.friendlyName],
  });
  await app.thirdPartyDetails.notificationBanner.expectNotification(
    'Third party added successfully'
  );
});

test('Can add conditions on details, does this issue impact customers, internal or external issue, attatch files, owner, contributor, departments and tags', async ({
  app,
  page,
}) => {
  test.slow();
  await updateOrganisationFeatures(['conditional_fields', 'third_party']);
  await page.goto('/');

  await app.thirdPartyScenarios.navigateToAddThirdPartyPage();

  const form = app.thirdPartyDetails.detailsTab.thirdPartyForm;
  const conditionalFields = [
    form.fields.companyName,
    form.fields.criticality,
    form.fields.description,
    form.fields.companiesHouseNumber,
    form.fields.address,
    form.fields.city,
    form.fields.postcode,
    form.fields.country,
    form.fields.primaryContactName,
    form.fields.contactName,
    form.fields.email,
    form.fields.companyDomain,
    form.fields.contributors,
    form.fields.tags,
    form.fields.departments,
    form.fields.attachFiles,
  ];

  await app.customAttributeScenarios.bulkEditFields(form, [
    ...conditionalFields.map((field) => ({
      field,
      values: { conditions: 'Title=test' },
    })),
  ]);

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
    type: 'Consultant',
    status: 'Active',
    owners: [users.riskManager.friendlyName],
  });
  await app.thirdPartyDetails.notificationBanner.expectNotification(
    'Third party added successfully'
  );
});
