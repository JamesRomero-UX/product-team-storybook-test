import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import {
  getIssueChangeRequestByIssueTitle,
  insertDepartmentTypes,
  insertTagTypes,
  updateOrganisationFeatures,
} from '../apiClient';
import { invokeLambda } from '../awsUtils';
import { test } from '../base';
import type { App } from '../models/App';
import type {
  AddCustomFieldFormValues,
  CustomFieldTypes,
} from '../models/forms/AddCustomFieldForm';
import type { FormFieldValue } from '../models/forms/BaseForm';
import type { CustomisableField } from '../models/forms/fields/CustomisableField';
import { getOrganisation } from '../organisationPool';
import { buildIssueFormValues } from '../testData/issueFormValuesBuilder';
import { users } from '../users';

[
  users.public,
  users.standard,
  users.riskManager,
  users.customerSupport,
].forEach((user) => {
  test.describe(`Report an Issue heading is "Report an issue"`, () => {
    test.use({ user });
    test(user.role, async ({ page, app }) => {
      await page.goto('/');
      await app.reportAnIssuePage.navigateToAndAssertTitle();
    });
  });
});

[
  users.public,
  users.standard,
  users.riskManager,
  users.customerSupport,
].forEach((user) => {
  test.describe(`Success message shown after reporting an issue`, () => {
    test.use({ user });
    test(user.role, async ({ page, app }) => {
      await page.goto('/');
      await app.reportAnIssuePage.navigateToAndAssertTitle();

      const issue = buildIssueFormValues();

      await app.reportAnIssuePage.issueForm.fillFormAndClickSave(issue);
      await app.reportAnIssuePage.notificationBanner.expectNotification(
        'Issue added successfully'
      );

      await expect(app.issueReportedPage.title).toHaveText(
        'Thank you for submitting an issue'
      );
      await expect(app.issueReportedPage.subtitle).toHaveText('Issue ID: I-1');
    });
  });
});

[users.riskManager, users.customerSupport].forEach((user) => {
  test.describe(`Report an issue page reports correct type`, () => {
    test.use({ user });
    test(user.role, async ({ page, app }) => {
      await page.goto('/');
      await app.reportAnIssuePage.navigateToAndAssertTitle();

      const issue = buildIssueFormValues();

      await app.reportAnIssuePage.issueForm.fillFormAndClickSave(issue);

      await app.reportAnIssuePage.notificationBanner.expectNotification(
        'Issue added successfully'
      );

      await expect(app.issueReportedPage.title).toHaveText(
        'Thank you for submitting an issue'
      );

      await page.goto('/');
      await app.issueRegisterPage.navigateToAndAssertTitle();

      await app.issueRegisterPage.table.expectRowCount(1);
      await (await app.issueRegisterPage.table.getBodyCell('Title', 1))
        .getByText(issue.title)
        .click();

      await expect(app.issueDetailsPage.header.title).toHaveText(issue.title);
    });
  });
});

[users.standard, users.riskManager].forEach((user) => {
  test.describe(`Issue Register heading is "Issue Register"`, () => {
    test.use({ user });
    test(user.role, async ({ page, app }) => {
      await page.goto('/');
      await app.issueRegisterPage.navigateToAndAssertTitle();
    });
  });
});

test('Title, details, date occurred and date identified are required fields', async ({
  page,
  app,
}) => {
  await page.goto('/');
  await app.issueRegisterPage.navigateToAndAssertTitle();
  await app.issueRegisterPage.addButton.click();
  await app.issueDetailsPage.issueDetailsTab.issueForm.saveButton.click();
  const errors =
    await app.issueDetailsPage.issueDetailsTab.issueForm.getErrors();
  expect(errors).toEqual({
    dateIdentified: 'Required',
    dateOccurred: 'Required',
    details: 'Required',
    title: 'Required',
  });
});

test('Saved issue details shown in form', async ({ page, app }) => {
  await insertTagTypes([
    { Name: 'Tag 1', Description: 'Tag 1 description' },
    { Name: 'Tag 2', Description: 'Tag 2 description' },
  ]);
  await insertDepartmentTypes([
    { Name: 'Department 1', Description: 'Department 1 description' },
    { Name: 'Department 2', Description: 'Department 2 description' },
  ]);
  await page.goto('/');

  const issue = buildIssueFormValues({
    attachFiles: [__dirname + '/testFiles/testFile.txt'],
    tags: ['Tag 1', 'Tag 2'],
    departments: ['Department 1', 'Department 2'],
  });

  await app.issueScenarios.createIssue(issue);

  await app.issueRegisterPage.table.clickCellLink('Title', 1);

  await app.issueDetailsPage.issueDetailsTab.issueForm.expectValues({
    ...issue,
    attachFiles: ['testFile.txt'],
  });
});

test('Issue details updated correctly', async ({ page, app }) => {
  await insertTagTypes([{ Name: 'Tag 1', Description: 'Tag 1 description' }]);
  await insertDepartmentTypes([
    { Name: 'Department 1', Description: 'Department 1 description' },
  ]);
  await page.goto('/');

  const issueValues = buildIssueFormValues({
    tags: ['Tag 1'],
    departments: ['Department 1'],
  });

  await app.issueScenarios.createIssue(issueValues);

  const updatedIssueValues = buildIssueFormValues({
    title: 'Issue 1 updated',
    details: 'Issue description 1 updated',
    dateIdentified: '2020-01-02',
    dateOccurred: '2020-01-02',
    impactsCustomer: 'No',
    isExternalIssue: 'Internal',
  });

  await app.issueScenarios.updateIssue(1, updatedIssueValues);
  await app.issueRegisterPage.table.expectRowCount(1);
  await app.issueRegisterPage.table.clickCellLink('Title', 1);

  await app.issueDetailsPage.issueDetailsTab.issueForm.expectValues({
    ...updatedIssueValues,
  });
});

const viewInTableTestCases: {
  fieldType: CustomFieldTypes;
  value: FormFieldValue;
  expectedExportValue: string;
  expectedValue: string | string[];
  setupData?: () => Promise<void>;
  additionalCustomFieldAttributes?: Partial<AddCustomFieldFormValues>;
  additionalAssertions?: (options: {
    page: Page;
    app: App;
    newFieldName: string;
  }) => Promise<void>;
}[] = [
  {
    fieldType: 'Dropdown',
    value: 'Test Value 1',
    expectedExportValue: `"Test Value 1"`,
    additionalCustomFieldAttributes: {
      options: ['Test Value 1', 'Test Value 2'],
    },
    expectedValue: 'Test Value 1',
  },
  {
    fieldType: 'Multiselect',
    value: ['Test Value 1', 'Test Value 3'],
    expectedExportValue: `"Test Value 1,Test Value 3"`,
    additionalCustomFieldAttributes: {
      options: ['Test Value 1', 'Test Value 2', 'Test Value 3'],
    },
    expectedValue: ['Test Value 1', 'Test Value 3'],
  },
  {
    fieldType: 'Text',
    value: 'Test Value 1',
    expectedExportValue: `"Test Value 1"`,
    expectedValue: 'Test Value 1',
  },
  {
    fieldType: 'Text area',
    value: 'Test Value 1',
    expectedExportValue: `"Test Value 1"`,
    expectedValue: 'Test Value 1',
  },
  {
    fieldType: 'Date',
    value: '2023-01-01',
    expectedExportValue: `"01/01/2023 00:00"`,
    expectedValue: '1 Jan 2023',
  },
  {
    fieldType: 'Link',
    value: 'https://www.google.com',
    expectedExportValue: `"https://www.google.com"`,
    expectedValue: 'https://www.google.com',
    additionalAssertions: async ({ page, app, newFieldName }) => {
      await app.riskRegisterPage.table.clickCellLink(newFieldName, 1);

      const pagePromise = page.waitForEvent('popup');
      const newTab = await pagePromise;
      await newTab.waitForLoadState();
      await expect(newTab).toHaveURL('https://www.google.com');
    },
  },
  {
    fieldType: 'User',
    value: [users.standard.friendlyName, users.riskManager.friendlyName],
    expectedExportValue: `"${users.standard.friendlyName}, ${users.riskManager.friendlyName}"`,
    expectedValue: [
      users.riskManager.friendlyName,
      users.standard.friendlyName,
    ],
  },
  {
    fieldType: 'Department',
    value: ['Department 1', 'Department 3'],
    expectedExportValue: `"Department 1, Department 3"`,
    expectedValue: ['Department 1', 'Department 3'],
    setupData: async () => {
      await insertDepartmentTypes([
        { Name: 'Department 1', Description: 'Description 1' },
        { Name: 'Department 2', Description: 'Description 2' },
        { Name: 'Department 3', Description: 'Description 3' },
      ]);
    },
  },
];

viewInTableTestCases.forEach(
  ({
    fieldType,
    value,
    expectedValue,
    setupData,
    additionalAssertions,
    additionalCustomFieldAttributes,
    expectedExportValue,
  }) => {
    test(`Can add a custom "${fieldType}" field, see it in a register, and export it`, async ({
      page,
      app,
    }) => {
      if (setupData) {
        await setupData();
      }
      await page.goto('/');

      await app.issueRegisterPage.navigateToAndAssertTitle();
      await app.issueRegisterPage.addButton.click();

      const issueForm = app.issueRegisterPage.issueModal.issueForm;

      const newFieldName = 'New Field 1';
      await app.customAttributeScenarios.addCustomAttribute(issueForm, {
        fieldType,
        label: newFieldName,
        description: 'New Field Description 1',
        ...additionalCustomFieldAttributes,
      });
      const issue = buildIssueFormValues();
      await issueForm.fillFormAndClickSave(issue, [
        {
          type: fieldType,
          label: newFieldName,
          value,
        },
      ]);

      await app.issueRegisterPage.notificationBanner.expectNotification(
        'Issue added successfully'
      );

      await app.issueRegisterPage.table.toggleVisibleColumns([
        'ID',
        newFieldName,
      ]);
      await app.issueRegisterPage.table.expectRowCount(1);
      await app.issueRegisterPage.table.expectRowToContain(1, {
        [newFieldName]: expectedValue,
      });

      const result = (
        await app.issueRegisterPage.exportButton.downloadAndReturnContent()
      ).trim();

      expect(result).toEqual(
        `"ID","New Field 1"\r\n"I-1",${expectedExportValue}\r\n"",""` // Note, the extra line is because some fields have a footer row showing totals
      );

      if (additionalAssertions) {
        await additionalAssertions({ page, app, newFieldName });
      }
    });
  }
);

test(`Issue details cancel navigates to register`, async ({ page, app }) => {
  await page.goto('/');
  const issue = buildIssueFormValues();
  await app.issueScenarios.createIssue(issue);

  await app.issueRegisterPage.table.clickCellLink('Title', 1);

  await expect(app.issueDetailsPage.header.title).toHaveText(issue.title);

  await app.issueDetailsPage.issueDetailsTab.issueForm.cancelButton.click();
  await expect(app.issueRegisterPage.header.title).toHaveText(`Issue Register`);
});

test(`A saved issue is shown in the register`, async ({ page, app }) => {
  await page.goto('/');
  const issue = buildIssueFormValues();

  await app.issueScenarios.createIssue(issue);

  await expect(
    await app.issueRegisterPage.table.getBodyCell('Title', 1)
  ).toHaveText(issue.title);
});

test('Can delete an issue', async ({ page, app }) => {
  await page.goto('/');

  const issue = buildIssueFormValues();

  await app.issueScenarios.createIssue(issue);

  await app.issueRegisterPage.table.clickCellLink('Title', 1);
  await app.issueDetailsPage.deleteButton.click();
  await app.issueDetailsPage.deleteModal.confirmButton.click();

  await app.issueDetailsPage.notificationBanner.expectNotification(
    'Issue deleted successfully'
  );

  await expect(app.issueRegisterPage.header.title).toHaveText(`Issue Register`);
});

test('User returned to issue register after approving a delete request', async ({
  page,
  app,
}) => {
  await updateOrganisationFeatures(['approvers']);
  await page.goto('/');

  await app.settingsPage.navigateToAndAssertTitle();
  await app.settingsPage.approvalsTab.selectTab();
  await app.settingsPage.approvalsTab.addButton.click();
  await app.settingsPage.approvalsTab.approversModal.approvalForm.fillFormAndClickSave(
    {
      workflow: 'Delete Issue',
      approvers: ['RiskManager1'],
    }
  );
  await app.settingsPage.notificationBanner.expectNotification(
    'Approval added successfully'
  );

  const issue = buildIssueFormValues();

  await app.issueScenarios.createIssue(issue);

  await app.issueRegisterPage.table.clickCellLink('Title', 1);
  await app.issueDetailsPage.deleteButton.click();
  await app.issueDetailsPage.deleteModal.confirmButton.click();
  await app.issueDetailsPage.issueDetailsTab.issueForm.actionRequiresApprovalModal.submitForApproval.click();
  await app.issueDetailsPage.issueDetailsTab.issueForm.changeRequestAlert.showDeleteRequestButton.click();
  await app.issueDetailsPage.issueDetailsTab.issueForm.approvalPanel.approveButton.click();

  const changeRequest = await getIssueChangeRequestByIssueTitle(issue.title);
  expect(changeRequest?.parent?.Id).toBeDefined();
  await invokeLambda('event-updateCRStatus', {
    detail: {
      event: {
        session_variables: {
          'x-hasura-org-id': getOrganisation().orgKey,
          'x-hasura-user-id': users.riskManager.Id,
          'x-hasura-role': users.riskManager.role,
          'x-hasura-tenant-name': 'MultiTenant',
        },
        data: {
          new: {
            Id: changeRequest?.parent?.Id,
            ChangeRequestId: changeRequest.Id,
          },
        },
      },
    },
  });
  await app.issueDetailsPage.issueDetailsTab.issueForm.changeRequestAlert.waitToBeRemoved();

  await expect(app.issueRegisterPage.header.title).toHaveText(`Issue Register`);
});

test('Updated issue field names shown in register', async ({ page, app }) => {
  test.slow();
  await page.goto('/');

  const issue = buildIssueFormValues({});
  await app.issueRegisterPage.navigateToAndAssertTitle();
  await app.issueRegisterPage.addButton.click();
  const form = app.issueDetailsPage.issueDetailsTab.issueForm;
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
      field: form.fields.details,
      newLabel: 'New details',
    },
    {
      field: form.fields.impactsCustomer,
      newLabel: 'New impacts customers',
    },
    {
      field: form.fields.isExternalIssue,
      newLabel: 'New internal or external issue',
    },
    {
      field: form.fields.dateOccurred,
      newLabel: 'New date occurred',
    },
    {
      field: form.fields.dateIdentified,
      newLabel: 'New date identified',
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
      field: form.fields.attachFiles,
      newLabel: 'New attach files',
      notInRegister: true,
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

  await form.fillFormAndClickSave(issue);
  await app.issueDetailsPage.notificationBanner.expectNotification(
    'Issue added successfully'
  );

  await app.issueRegisterPage.navigateToAndAssertTitle();
  await app.issueRegisterPage.table.expectRowCount(1);
  await app.issueRegisterPage.table.toggleVisibleColumns(
    fieldsToRename.filter((f) => !f.notInRegister).map((f) => f.newLabel)
  );
  await app.issueRegisterPage.table.expectRowToContain(1, {
    'New title': issue.title,
    'New details': issue.details,
    'New impacts customers': issue.impactsCustomer,
    'New internal or external issue': issue.isExternalIssue,
    'New date occurred': '1 Jan 2020',
    'New date identified': '1 Jan 2020',
    'New owners': issue.owners,
    'New contributors': '',
    'New tags': '',
    'New departments': '',
  });
});

test('Updated issue field names shown in custom datasource', async ({
  page,
  app,
}) => {
  test.slow();
  await updateOrganisationFeatures(['multi_reporting']);
  await page.goto('/');

  const issue = buildIssueFormValues({});
  await app.issueRegisterPage.navigateToAndAssertTitle();
  await app.issueRegisterPage.addButton.click();

  await app.issueDetailsPage.issueDetailsTab.issueForm.formSettingsButton.openAndClickItem(
    'Edit form'
  );

  const fieldsToRename: {
    field: CustomisableField;
    newLabel: string;
    notInCds?: boolean;
  }[] = [
    {
      field: app.issueDetailsPage.issueDetailsTab.issueForm.fields.title,
      newLabel: 'New title',
    },
    {
      field: app.issueDetailsPage.issueDetailsTab.issueForm.fields.details,
      newLabel: 'New details',
    },
    {
      field:
        app.issueDetailsPage.issueDetailsTab.issueForm.fields.impactsCustomer,
      newLabel: 'New impacts customers',
    },
    {
      field:
        app.issueDetailsPage.issueDetailsTab.issueForm.fields.isExternalIssue,
      newLabel: 'New internal or external issue',
    },
    {
      field: app.issueDetailsPage.issueDetailsTab.issueForm.fields.dateOccurred,
      newLabel: 'New date occurred',
    },
    {
      field:
        app.issueDetailsPage.issueDetailsTab.issueForm.fields.dateIdentified,
      newLabel: 'New date identified',
    },
    {
      field: app.issueDetailsPage.issueDetailsTab.issueForm.fields.owners,
      newLabel: 'New owners',
    },
    {
      field: app.issueDetailsPage.issueDetailsTab.issueForm.fields.contributors,
      newLabel: 'New contributors',
    },
    {
      field: app.issueDetailsPage.issueDetailsTab.issueForm.fields.attachFiles,
      newLabel: 'New attach files',
      notInCds: true,
    },
    {
      field: app.issueDetailsPage.issueDetailsTab.issueForm.fields.tags,
      newLabel: 'New tags',
    },
    {
      field: app.issueDetailsPage.issueDetailsTab.issueForm.fields.departments,
      newLabel: 'New departments',
    },
  ];

  for (const { field, newLabel } of fieldsToRename) {
    await app.customAttributeScenarios.editField(field, {
      enableCustomLabel: true,
      label: newLabel,
    });
  }

  await app.issueDetailsPage.issueDetailsTab.issueForm.saveFormConfigurationButton.click();

  await app.issueDetailsPage.issueDetailsTab.issueForm.fillFormAndClickSave(
    issue
  );
  await app.issueDetailsPage.notificationBanner.expectNotification(
    'Issue added successfully'
  );

  await app.customDatasourcesPage.navigateToAndAssertTitle();
  await app.customDatasourcesPage.addButton.click();
  await expect(app.customDatasourceUpdatePage.header.title).toHaveText(
    'Add Custom Datasource'
  );

  await app.customDatasourceUpdatePage.form.fillForm({
    title: 'Issues data source',
    dataSource: {
      type: 'Issues',
      fields: fieldsToRename
        .filter((f) => !f.notInCds)
        .map((f) => ({ defaultLabel: f.newLabel })),
    },
  });
  await app.customDatasourceUpdatePage.form.previewButton.click();
  await app.customDatasourceUpdatePage.table.expectRowCount(1);
  await app.customDatasourceUpdatePage.table.expectTableToContain({
    'New title': issue.title,
    'New details': issue.details,
    'New impacts customers': issue.impactsCustomer,
    'New internal or external issue': issue.isExternalIssue,
    'New date occurred': '1 Jan 2020',
    'New date identified': '1 Jan 2020',
    'New owners': issue.owners,
    'New contributors': '',
    'New tags': '',
    'New departments': '',
  });
});

test('Cannot set title, date occurrred or date identified as unrequired or add conditions', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['conditional_fields']);
  await page.goto('/');
  await app.issueRegisterPage.navigateToAndAssertTitle();
  await app.issueRegisterPage.addButton.click();

  const form = app.issueRegisterPage.issueModal.issueForm;
  const requiredFields = [
    form.fields.title,
    form.fields.dateOccurred,
    form.fields.dateIdentified,
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

test('Can set details, does this issue impact customers, internal or external issue, attatch files, owner, contributor, departments and tags as unrequired', async ({
  app,
  page,
}) => {
  await page.goto('/');
  await app.issueRegisterPage.navigateToAndAssertTitle();
  await app.issueRegisterPage.addButton.click();

  const form = app.issueRegisterPage.issueModal.issueForm;
  const unrequiredFields = [
    form.fields.details,
    form.fields.impactsCustomer,
    form.fields.isExternalIssue,
    form.fields.attachFiles,
    form.fields.owners,
    form.fields.contributors,
    form.fields.departments,
    form.fields.tags,
  ];

  await app.customAttributeScenarios.bulkEditFields(form, [
    ...unrequiredFields.map((field) => ({
      field,
      values: { required: false },
    })),
  ]);

  await form.fillFormAndClickSave({
    title: 'Title',
    dateOccurred: '2020-01-01',
    dateIdentified: '2020-01-01',
  });
  await app.issueDetailsPage.notificationBanner.expectNotification(
    'Issue added successfully'
  );
  await app.issueRegisterPage.table.expectRowCount(1);
});

test('Can add conditions on details, does this issue impact customers, internal or external issue, attatch files, owner, contributor, departments and tags', async ({
  app,
  page,
}) => {
  await updateOrganisationFeatures(['conditional_fields']);
  await page.goto('/');
  await app.issueRegisterPage.navigateToAndAssertTitle();
  await app.issueRegisterPage.addButton.click();

  const form = app.issueRegisterPage.issueModal.issueForm;
  const conditionalFields = [
    form.fields.details,
    form.fields.impactsCustomer,
    form.fields.isExternalIssue,
    form.fields.attachFiles,
    form.fields.owners,
    form.fields.contributors,
    form.fields.departments,
    form.fields.tags,
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
    title: 'minimal test',
    dateIdentified: '2020-01-01',
    dateOccurred: '2020-01-01',
  });
  await app.issueDetailsPage.notificationBanner.expectNotification(
    'Issue added successfully'
  );
});
