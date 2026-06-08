import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import {
  insertDepartmentTypes,
  insertTagTypes,
  updateOrganisationFeatures,
} from '../apiClient';
import { test } from '../base';
import type { App } from '../models/App';
import type {
  AddCustomFieldFormValues,
  CustomFieldTypes,
} from '../models/forms/AddCustomFieldForm';
import type { AltValueOption, FormFieldValue } from '../models/forms/BaseForm';
import { buildRiskFormValues } from '../testData/riskFormValuesBuilder';
import { users } from '../users';

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

test.setTimeout(60000);

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

      await app.riskRegisterPage.navigateToAndAssertTitle(true);
      await app.riskRegisterPage.addButton.click();
      await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);

      const riskForm = app.addRiskPage.detailsTab.riskForm;

      const newFieldName = 'New Field 1';
      await app.customAttributeScenarios.addCustomAttribute(riskForm, {
        fieldType,
        label: newFieldName,
        description: 'New Field Description 1',
        ...additionalCustomFieldAttributes,
      });

      await riskForm.fillFormAndClickSave(
        {
          riskName: 'Risk 1',
          description: 'Risk 1 Description',
        },
        [
          {
            type: fieldType,
            label: newFieldName,
            value,
          },
        ]
      );

      await app.riskRegisterPage.notificationBanner.expectNotification(
        'Risk added successfully'
      );

      await expect(app.riskDetailsPage.header.title).toHaveText('Risk 1');
      await app.riskRegisterPage.navigateToAndAssertTitle(true);

      await app.riskRegisterPage.table.toggleVisibleColumns([
        'ID',
        newFieldName,
      ]);
      await app.riskRegisterPage.table.expectRowCount(1);
      await app.riskRegisterPage.table.expectRowToContain(1, {
        [newFieldName]: expectedValue,
      });

      const result = (
        await app.riskRegisterPage.exportButton.downloadAndReturnContent()
      ).trim();

      expect(result).toEqual(
        `"ID","New Field 1"\r\n"R-1",${expectedExportValue}`
      );

      if (additionalAssertions) {
        await additionalAssertions({ page, app, newFieldName });
      }
    });
  }
);

const AltValueOptionsTestCases: {
  fieldType: CustomFieldTypes;
  label: string;
  altLabel: string;
  options: AltValueOption[];
  expectedValue: string | string[];
  expectedAltValue: string | string[];
  selectedValue: string | string[];
  expectedExportValue: string;
  expectedExportAltValue: string;
  setupData?: () => Promise<void>;
}[] = [
  {
    fieldType: 'Dropdown',
    label: 'What is your favourite colour?',
    altLabel: 'FAVE_COL',
    options: [
      {
        _tag: 'AltValueOption',
        altValue: 'COL_IR',
        value: 'Infrared',
      },
      {
        _tag: 'AltValueOption',
        altValue: 'COL_UV',
        value: 'Ultraviolet',
      },
    ],
    selectedValue: 'Ultraviolet',
    expectedValue: 'Ultraviolet',
    expectedAltValue: 'COL_UV',
    expectedExportValue: `Ultraviolet`,
    expectedExportAltValue: `COL_UV`,
  },
  {
    fieldType: 'Multiselect',
    label: 'What do you want on your sandwich?',
    altLabel: 'SANDO_ING',
    options: [
      { _tag: 'AltValueOption', altValue: 'ING_TOM', value: 'Tomato' },
      { _tag: 'AltValueOption', altValue: 'ING_CHE', value: 'Cheese' },
      { _tag: 'AltValueOption', altValue: 'ING_BAC', value: 'Bacon' },
    ],
    selectedValue: ['Bacon', 'Cheese'],
    expectedValue: ['Bacon', 'Cheese'],
    expectedAltValue: ['ING_BAC', 'ING_CHE'],
    expectedExportValue: `Bacon,Cheese`,
    expectedExportAltValue: `ING_BAC,ING_CHE`,
  },
];

AltValueOptionsTestCases.forEach(
  ({
    fieldType,
    label,
    altLabel,
    options,
    setupData,
    selectedValue,
    expectedValue,
    expectedAltValue,
    expectedExportValue,
    expectedExportAltValue,
  }) => {
    test(`Can add a seperate code for "${fieldType}" which is displyed in the export but not in the register`, async ({
      page,
      app,
    }) => {
      await updateOrganisationFeatures(['alt_values']);

      if (setupData) {
        await setupData();
      }
      await page.goto('/');

      await app.riskRegisterPage.navigateToAndAssertTitle(true);
      await app.riskRegisterPage.addButton.click();
      await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);

      const riskForm = app.addRiskPage.detailsTab.riskForm;

      const values: Partial<AddCustomFieldFormValues> = {
        fieldType,
        label,
        showAltValues: true,
        altLabel,
        description: 'New Field Description 1',
        options,
      };

      await app.customAttributeScenarios.addCustomAttribute(riskForm, values);

      await riskForm.fillFormAndClickSave(
        {
          riskName: 'Risk 1',
          description: 'Risk 1 Description',
        },
        [
          {
            type: fieldType,
            label,
            value: selectedValue,
          },
        ]
      );

      await app.riskRegisterPage.notificationBanner.expectNotification(
        'Risk added successfully'
      );

      await expect(app.riskDetailsPage.header.title).toHaveText(`Risk 1`);

      await app.riskRegisterPage.navigateToAndAssertTitle(true);
      await app.riskRegisterPage.table.toggleVisibleColumns([
        'ID',
        label,
        altLabel,
      ]);
      await app.riskRegisterPage.table.expectRowCount(1);
      await app.riskRegisterPage.table.expectRowToContain(1, {
        [label]: expectedValue,
        [altLabel]: expectedAltValue,
      });

      const result = (
        await app.riskRegisterPage.exportButton.downloadAndReturnContent()
      ).trim();

      expect(result).toEqual(
        `"ID","${label}","${altLabel}"\r\n"R-1","${expectedExportValue}","${expectedExportAltValue}"`
      );
    });
  }
);

const filteringTableTestCases: {
  fieldType: CustomFieldTypes;
  value1: FormFieldValue;
  value2: FormFieldValue;
  filtervalue: string;
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
    value1: 'Test Value 1',
    value2: 'Test Value 2',
    filtervalue: 'Test Value 1',
    additionalCustomFieldAttributes: {
      options: ['Test Value 1', 'Test Value 2'],
    },
    expectedValue: 'Test Value 1',
  },
  {
    fieldType: 'Multiselect',
    value1: ['Test Value 1', 'Test Value 3'],
    filtervalue: 'Test Value 1',
    value2: 'Test Value 2',
    additionalCustomFieldAttributes: {
      options: ['Test Value 1', 'Test Value 2', 'Test Value 3'],
    },
    expectedValue: ['Test Value 1', 'Test Value 3'],
  },
  {
    fieldType: 'Text',
    value1: 'Test Value 1',
    filtervalue: 'Test Value 1',
    value2: 'Test Value 2',
    expectedValue: 'Test Value 1',
  },
  {
    fieldType: 'Text area',
    value1: 'Test Value 1',
    filtervalue: 'Test Value 1',
    value2: 'Test Value 2',
    expectedValue: 'Test Value 1',
  },
  {
    fieldType: 'Link',
    value1: 'https://www.google.com',
    filtervalue: 'https://www.google.com',
    value2: 'https://www.bing.com',
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
    value1: [users.standard.friendlyName, users.riskManager.friendlyName],
    filtervalue: users.standard.friendlyName,
    value2: [users.standardEnhanced.friendlyName],
    expectedValue: [
      users.riskManager.friendlyName,
      users.standard.friendlyName,
    ],
  },
];

filteringTableTestCases.forEach(
  ({
    fieldType,
    value1,
    value2,
    expectedValue,
    setupData,
    additionalAssertions,
    additionalCustomFieldAttributes,
    filtervalue,
  }) => {
    test(`Can filter custom "${fieldType}" fields in a register`, async ({
      page,
      app,
    }) => {
      if (setupData) {
        await setupData();
      }
      await page.goto('/');

      await app.riskRegisterPage.navigateToAndAssertTitle(true);
      await app.riskRegisterPage.addButton.click();
      await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);

      const riskForm = app.addRiskPage.detailsTab.riskForm;

      const newFieldName = 'New Field 1';
      await app.customAttributeScenarios.addCustomAttribute(riskForm, {
        fieldType,
        label: newFieldName,
        description: 'New Field Description 1',
        ...additionalCustomFieldAttributes,
      });

      await riskForm.fillFormAndClickSave(
        {
          riskName: 'Risk 1',
          description: 'Risk 1 Description',
        },
        [
          {
            type: fieldType,
            label: newFieldName,
            value: value1,
          },
        ]
      );
      await app.riskRegisterPage.notificationBanner.expectNotification(
        'Risk added successfully'
      );
      await expect(app.riskDetailsPage.header.title).toHaveText(`Risk 1`);

      await app.riskRegisterPage.navigateToAndAssertTitle(true);
      await app.riskRegisterPage.addButton.click();
      await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);

      await riskForm.fillFormAndClickSave(
        {
          riskName: 'Risk 2',
          description: 'Risk 2 Description',
        },
        [
          {
            type: fieldType,
            label: newFieldName,
            value: value2,
          },
        ]
      );

      await app.riskRegisterPage.notificationBanner.expectNotification(
        'Risk added successfully'
      );
      await expect(app.riskDetailsPage.header.title).toHaveText(`Risk 2`);

      await app.riskRegisterPage.navigateToAndAssertTitle(true);
      await app.riskRegisterPage.table.toggleColumnVisibilityFromTable(
        newFieldName,
        true
      );
      await app.riskRegisterPage.table.expectRowCount(2);
      await app.riskRegisterPage.table.setFilterInputByNameAndValue(
        newFieldName,
        filtervalue
      );
      await app.riskRegisterPage.table.expectRowToContain(1, {
        [newFieldName]: expectedValue,
      });
      if (additionalAssertions) {
        await additionalAssertions({ page, app, newFieldName });
      }
    });
  }
);

const viewInChangeRequestTestCases: {
  fieldType: CustomFieldTypes;
  originalValue: FormFieldValue;
  expectedOriginalValueChangesText: string;
  updatedValue: FormFieldValue;
  expectedUpdatedValueChangesText: string;
  additionalCustomFieldAttributes?: Partial<AddCustomFieldFormValues>;
  setupData?: () => Promise<void>;
}[] = [
  {
    fieldType: 'Dropdown',
    originalValue: 'Test Value 1',
    updatedValue: 'Test Value 2',
    additionalCustomFieldAttributes: {
      options: ['Test Value 1', 'Test Value 2'],
    },
    expectedOriginalValueChangesText: 'Test Value 1',
    expectedUpdatedValueChangesText: 'Test Value 2',
  },
  {
    fieldType: 'Multiselect',
    originalValue: ['Test Value 1', 'Test Value 3'],
    updatedValue: ['Test Value 1', 'Test Value 2'],
    additionalCustomFieldAttributes: {
      options: ['Test Value 1', 'Test Value 2', 'Test Value 3'],
    },
    expectedOriginalValueChangesText: 'Test Value 1,Test Value 3',
    expectedUpdatedValueChangesText: 'Test Value 1,Test Value 2',
  },
  {
    fieldType: 'Date',
    originalValue: '2023-01-01',
    expectedOriginalValueChangesText: '2023-01-01T00:00:00.000Z',
    updatedValue: '2023-02-03',
    expectedUpdatedValueChangesText: '2023-02-03T00:00:00.000Z',
  },
  {
    fieldType: 'Link',
    originalValue: 'https://example.com',
    expectedOriginalValueChangesText: 'https://example.com',
    updatedValue: 'https://example.org',
    expectedUpdatedValueChangesText: 'https://example.org',
  },
  {
    fieldType: 'Text',
    originalValue: 'Test Value 1',
    expectedOriginalValueChangesText: 'Test Value 1',
    updatedValue: 'Test Value 2',
    expectedUpdatedValueChangesText: 'Test Value 2',
  },
  {
    fieldType: 'Text area',
    originalValue: 'Test Value 1',
    expectedOriginalValueChangesText: 'Test Value 1',
    updatedValue: 'Test Value 2',
    expectedUpdatedValueChangesText: 'Test Value 2',
  },
  {
    fieldType: 'User',
    originalValue: [
      users.standard.friendlyName,
      users.riskManager.friendlyName,
    ],
    expectedOriginalValueChangesText: 'Standard1, RiskManager1',
    updatedValue: [users.standard.friendlyName, users.public.friendlyName],
    expectedUpdatedValueChangesText: 'Standard1, Public1',
  },
  {
    fieldType: 'Department',
    originalValue: ['Department 1'],
    expectedOriginalValueChangesText: 'Department 1',
    updatedValue: ['Department 2'],
    expectedUpdatedValueChangesText: 'Department 2',
    setupData: async () => {
      await insertDepartmentTypes([
        { Name: 'Department 1', Description: 'Description 1' },
        { Name: 'Department 2', Description: 'Description 2' },
        { Name: 'Department 3', Description: 'Description 3' },
      ]);
    },
  },
];

viewInChangeRequestTestCases.forEach(
  ({
    fieldType,
    originalValue,
    updatedValue,
    expectedOriginalValueChangesText,
    expectedUpdatedValueChangesText,
    setupData,
    additionalCustomFieldAttributes,
  }) => {
    test(`Can add a custom "${fieldType}" field and see it in a change request`, async ({
      app,
      page,
    }) => {
      if (setupData) {
        await setupData();
      }
      await updateOrganisationFeatures(['approvers']);
      await page.goto('/');

      await app.settingsPage.navigateToAndAssertTitle();
      await app.settingsPage.approvalsTab.selectTab();
      await app.settingsPage.approvalsTab.addButton.click();
      await app.settingsPage.approvalsTab.approversModal.approvalForm.fillFormAndClickSave(
        {
          workflow: 'Update Risk details',
          approvers: ['RiskManager1'],
        }
      );
      await app.settingsPage.notificationBanner.expectNotification(
        'Approval added successfully'
      );

      await app.riskRegisterPage.navigateToAndAssertTitle(true);
      await app.riskRegisterPage.addButton.click();
      await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);

      const riskForm = app.addRiskPage.detailsTab.riskForm;

      const newFieldName = 'Custom field';
      await app.customAttributeScenarios.addCustomAttribute(riskForm, {
        fieldType,
        label: newFieldName,
        description: 'New Field Description 1',
        ...additionalCustomFieldAttributes,
      });
      await riskForm.fillFormAndClickSave(
        {
          riskName: 'Risk 1',
          description: 'Risk 1 Description',
        },
        [
          {
            type: fieldType,
            label: newFieldName,
            value: originalValue,
          },
        ]
      );

      await app.riskRegisterPage.notificationBanner.expectNotification(
        'Risk added successfully'
      );
      await expect(app.riskDetailsPage.header.title).toHaveText('Risk 1');
      await expect(app.riskDashboardPage.header.title).toHaveText('Risk 1');

      await riskForm.fillFormAndClickSave({}, [
        {
          type: fieldType,
          label: newFieldName,
          value: updatedValue,
        },
      ]);
      await riskForm.actionRequiresApprovalModal.submitForApproval.click();

      await app.riskRegisterPage.notificationBanner.expectNotification(
        'Change request confirmed'
      );

      await riskForm.changeRequestAlert.showPendingChangesButton.click();

      await expect(riskForm.approvalPanel.component).toBeVisible();

      await expect(
        riskForm.getCustomField(fieldType, newFieldName).showChangesButton
      ).toBeVisible();

      await riskForm
        .getCustomField(fieldType, newFieldName)
        .showChangesButton.click();

      await expect(
        riskForm.getCustomField(fieldType, newFieldName)
          .changesPopoverOriginalValue
      ).toHaveText(expectedOriginalValueChangesText);

      await expect(
        riskForm.getCustomField(fieldType, newFieldName).changesPopoverNewValue
      ).toHaveText(expectedUpdatedValueChangesText);
    });
  }
);

viewInTableTestCases.forEach(
  ({
    fieldType,
    value,
    expectedValue,
    setupData,
    additionalAssertions,
    additionalCustomFieldAttributes,
  }) => {
    test(`Can add a custom "${fieldType}" field and see it in a custom data source`, async ({
      page,
      app,
    }) => {
      await updateOrganisationFeatures(['multi_reporting']);
      if (setupData) {
        await setupData();
      }

      await page.goto('/');

      await app.riskRegisterPage.navigateToAndAssertTitle(true);
      await app.riskRegisterPage.addButton.click();
      await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);

      const riskForm = app.addRiskPage.detailsTab.riskForm;

      const newFieldName = 'Custom field';
      await app.customAttributeScenarios.addCustomAttribute(riskForm, {
        fieldType,
        label: newFieldName,
        description: 'New Field Description 1',
        ...additionalCustomFieldAttributes,
      });

      await riskForm.fillFormAndClickSave(
        {
          riskName: 'Risk 1',
          description: 'Risk 1 Description',
        },
        [
          {
            type: fieldType,
            label: newFieldName,
            value,
          },
        ]
      );

      await app.riskRegisterPage.notificationBanner.expectNotification(
        'Risk added successfully'
      );
      await expect(app.riskDetailsPage.header.title).toHaveText(`Risk 1`);

      await app.customDatasourcesPage.navigateToAndAssertTitle();
      await app.customDatasourcesPage.addButton.click();
      await expect(app.customDatasourceUpdatePage.header.title).toHaveText(
        'Add Custom Datasource'
      );

      await app.customDatasourceUpdatePage.form.fillForm({
        title: 'My data source',
        dataSource: { type: 'Risks', fields: [{ defaultLabel: newFieldName }] },
      });
      await app.customDatasourceUpdatePage.form.previewButton.click();
      await app.customDatasourceUpdatePage.table.expectRowCount(1);
      await app.customDatasourceUpdatePage.table.expectRowToContain(1, {
        [newFieldName]: expectedValue,
      });
      if (additionalAssertions) {
        await additionalAssertions({ page, app, newFieldName });
      }
    });
  }
);

test(`Can edit a custom field`, async ({ page, app }) => {
  await page.goto('/');

  await app.riskRegisterPage.navigateToAndAssertTitle(true);
  await app.riskRegisterPage.addButton.click();
  await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);

  const riskForm = app.addRiskPage.detailsTab.riskForm;

  const newFieldName = 'Custom field';
  await app.customAttributeScenarios.addCustomAttribute(riskForm, {
    fieldType: 'Text',
    label: newFieldName,
    description: 'New Field Description 1',
  });
  await riskForm.formSettingsButton.openAndClickItem('Edit form');
  await app.customAttributeScenarios.editField(
    riskForm.getCustomField('Text', newFieldName),
    {
      label: 'New label',
    }
  );
});

test(`Can delete a custom attribute`, async ({ page, app }) => {
  await updateOrganisationFeatures(['multi_reporting']);

  await page.goto('/');

  await app.riskRegisterPage.navigateToAndAssertTitle(true);
  await app.riskRegisterPage.addButton.click();
  await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);

  const riskForm = app.addRiskPage.detailsTab.riskForm;

  const newFieldName = 'Custom field';
  await app.customAttributeScenarios.addCustomAttribute(riskForm, {
    fieldType: 'Text',
    label: newFieldName,
    description: 'New Field Description 1',
  });

  await riskForm.fillFormAndClickSave(
    {
      riskName: 'Risk 1',
      description: 'Risk 1 Description',
    },
    [
      {
        type: 'Text',
        label: newFieldName,
        value: 'Value',
      },
    ]
  );

  await app.riskRegisterPage.notificationBanner.expectNotification(
    'Risk added successfully'
  );
  await expect(app.riskDetailsPage.header.title).toHaveText('Risk 1');
  await riskForm.formSettingsButton.openAndClickItem('Edit form');
  await riskForm.getCustomField('Text', newFieldName).editFieldButton.click();
  await app.customisableFieldModal.customisableFieldForm.deleteButton.click();
  await app.customisableFieldModal.deleteModal.confirmButton.click();
  await app.riskDetailsPage.notificationBanner.expectNotification(
    'Custom field deleted successfully'
  );
  await expect(
    await riskForm.getCustomField('Text', newFieldName).isVisible()
  ).toBeFalsy();
});

test('Can rename a standard field', async ({ page, app }) => {
  await updateOrganisationFeatures(['multi_reporting']);

  await page.goto('/');

  await app.riskRegisterPage.navigateToAndAssertTitle(true);
  await app.riskRegisterPage.addButton.click();
  await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);

  const riskForm = app.addRiskPage.detailsTab.riskForm;

  await riskForm.formSettingsButton.openAndClickItem('Edit form');
  await riskForm.fields.riskName.editFieldButton.click();
  await app.editFieldModal.editFieldForm.fillFormAndClickSave({
    enableCustomLabel: true,
    label: 'My new confusing risk name',
  });
  await app.riskDetailsPage.notificationBanner.expectNotification(
    'Custom field updated successfully'
  );
  const newLabel = await riskForm.fields.riskName.getLabel();
  expect(newLabel).toBe('My new confusing risk name');
});

test('Can filter multiselect custom fields using contains operator (:)', async ({
  page,
  app,
}) => {
  await page.goto('/');

  await app.riskRegisterPage.navigateToAndAssertTitle(true);
  await app.riskRegisterPage.addButton.click();
  await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);

  const riskForm = app.addRiskPage.detailsTab.riskForm;

  const newFieldName = 'Multiselect Test Field';
  await app.customAttributeScenarios.addCustomAttribute(riskForm, {
    fieldType: 'Multiselect',
    label: newFieldName,
    description: 'Multiselect field for testing contains operator',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
  });

  // Create first risk with Option A and Option B selected
  await riskForm.fillFormAndClickSave(
    {
      riskName: 'Risk 1',
      description: 'Risk 1 Description',
    },
    [
      {
        type: 'Multiselect',
        label: newFieldName,
        value: ['Option A', 'Option B'],
      },
    ]
  );
  await app.riskRegisterPage.notificationBanner.expectNotification(
    'Risk added successfully'
  );
  await expect(app.riskDetailsPage.header.title).toHaveText('Risk 1');

  await app.riskRegisterPage.navigateToAndAssertTitle(true);
  await app.riskRegisterPage.addButton.click();
  await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);

  // Create second risk with Option B and Option C selected
  await riskForm.fillFormAndClickSave(
    {
      riskName: 'Risk 2',
      description: 'Risk 2 Description',
    },
    [
      {
        type: 'Multiselect',
        label: newFieldName,
        value: ['Option B', 'Option C'],
      },
    ]
  );
  await app.riskRegisterPage.notificationBanner.expectNotification(
    'Risk added successfully'
  );
  await expect(app.riskDetailsPage.header.title).toHaveText('Risk 2');

  await app.riskRegisterPage.navigateToAndAssertTitle(true);
  await app.riskRegisterPage.addButton.click();
  await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);

  // Create third risk with only Option D selected
  await riskForm.fillFormAndClickSave(
    {
      riskName: 'Risk 3',
      description: 'Risk 3 Description',
    },
    [
      {
        type: 'Multiselect',
        label: newFieldName,
        value: ['Option D'],
      },
    ]
  );
  await app.riskRegisterPage.notificationBanner.expectNotification(
    'Risk added successfully'
  );
  await expect(app.riskDetailsPage.header.title).toHaveText('Risk 3');

  await app.riskRegisterPage.navigateToAndAssertTitle(true);
  await app.riskRegisterPage.table.toggleColumnVisibilityFromTable(
    newFieldName,
    true
  );

  // Verify all 3 risks are visible initially
  await app.riskRegisterPage.table.expectRowCount(3);

  // Test filtering for Option A using CONTAINS operator (:) - should show only Risk 1
  await app.riskRegisterPage.table.setFilterInput(`${newFieldName}:Option A`);
  await app.riskRegisterPage.table.expectRowCount(1);
  await app.riskRegisterPage.table.expectRowToContain(1, {
    'Risk name': 'Risk 1',
    [newFieldName]: ['Option A', 'Option B'],
  });

  // Clear filter and test filtering for Option B using CONTAINS operator (:) - should show Risk 1 and Risk 2
  await app.riskRegisterPage.table.clearFiltersButton.click();
  await app.riskRegisterPage.table.expectRowCount(3);

  await app.riskRegisterPage.table.setFilterInput(`${newFieldName}:Option B`);
  await app.riskRegisterPage.table.expectRowCount(2);
  await app.riskRegisterPage.table.expectRowToContain(1, {
    'Risk name': 'Risk 1',
    [newFieldName]: ['Option A', 'Option B'],
  });
  await app.riskRegisterPage.table.expectRowToContain(2, {
    'Risk name': 'Risk 2',
    [newFieldName]: ['Option B', 'Option C'],
  });

  // Clear filter and test filtering for Option D using CONTAINS operator (:) - should show only Risk 3
  await app.riskRegisterPage.table.clearFiltersButton.click();
  await app.riskRegisterPage.table.expectRowCount(3);

  await app.riskRegisterPage.table.setFilterInput(`${newFieldName}:Option D`);
  await app.riskRegisterPage.table.expectRowCount(1);
  await app.riskRegisterPage.table.expectRowToContain(1, {
    'Risk name': 'Risk 3',
    [newFieldName]: ['Option D'],
  });

  // Test filtering for non-existent option using CONTAINS operator (:) - should show no results
  await app.riskRegisterPage.table.clearFiltersButton.click();
  await app.riskRegisterPage.table.expectRowCount(3);

  await app.riskRegisterPage.table.setFilterInput(
    `${newFieldName}:Non-existent Option`
  );
  await app.riskRegisterPage.table.expectRowCount(0);
});

test('Multiselect custom fields support both equals and contains filter operators (both work as contains)', async ({
  page,
  app,
}) => {
  await page.goto('/');

  await app.riskRegisterPage.navigateToAndAssertTitle(true);
  await app.riskRegisterPage.addButton.click();
  await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);

  const riskForm = app.addRiskPage.detailsTab.riskForm;

  const newFieldName = 'Operators Test Field';
  await app.customAttributeScenarios.addCustomAttribute(riskForm, {
    fieldType: 'Multiselect',
    label: newFieldName,
    description: 'Testing filter operators for multiselect',
    options: ['Apple', 'Banana', 'Cherry', 'Durian Fruit', 'Elderberry'],
  });

  // Create first risk with Apple and Banana selected
  await riskForm.fillFormAndClickSave(
    {
      riskName: 'Risk 1',
      description: 'Risk with Apple and Banana',
    },
    [
      {
        type: 'Multiselect',
        label: newFieldName,
        value: ['Apple', 'Banana'],
      },
    ]
  );
  await app.riskRegisterPage.notificationBanner.expectNotification(
    'Risk added successfully'
  );
  await expect(app.riskDetailsPage.header.title).toHaveText('Risk 1');

  await app.riskRegisterPage.navigateToAndAssertTitle(true);
  await app.riskRegisterPage.addButton.click();
  await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);

  // Create second risk with only Durian Fruit selected (the compound option)
  await riskForm.fillFormAndClickSave(
    {
      riskName: 'Risk 2',
      description: 'Risk with Durian Fruit compound option',
    },
    [
      {
        type: 'Multiselect',
        label: newFieldName,
        value: ['Durian Fruit'],
      },
    ]
  );
  await app.riskRegisterPage.notificationBanner.expectNotification(
    'Risk added successfully'
  );
  await expect(app.riskDetailsPage.header.title).toHaveText('Risk 2');

  await app.riskRegisterPage.navigateToAndAssertTitle(true);
  await app.riskRegisterPage.table.toggleColumnVisibilityFromTable(
    newFieldName,
    true
  );

  // Verify both risks are visible initially
  await app.riskRegisterPage.table.expectRowCount(2);

  // Test CONTAINS operator (:) - filtering for "Apple" should match Risk 1 (has Apple) but NOT Risk 2 (has "Durian Fruit" but not "Apple")
  await app.riskRegisterPage.table.setFilterInput(`${newFieldName}:Apple`);
  await app.riskRegisterPage.table.expectRowCount(1);
  await app.riskRegisterPage.table.expectRowToContain(1, {
    'Risk name': 'Risk 1',
    [newFieldName]: ['Apple', 'Banana'],
  });

  // Test EQUALS operator (=) - currently works the same as contains for multiselect fields
  await app.riskRegisterPage.table.clearFiltersButton.click();
  await app.riskRegisterPage.table.expectRowCount(2);

  await app.riskRegisterPage.table.setFilterInput(`${newFieldName}=Apple`);
  await app.riskRegisterPage.table.expectRowCount(1); // Should match Risk 1 since it contains "Apple"
  await app.riskRegisterPage.table.expectRowToContain(1, {
    'Risk name': 'Risk 1',
    [newFieldName]: ['Apple', 'Banana'],
  });

  // Test CONTAINS operator (:) for "Banana" - should match Risk 1 only
  await app.riskRegisterPage.table.clearFiltersButton.click();
  await app.riskRegisterPage.table.expectRowCount(2);

  await app.riskRegisterPage.table.setFilterInput(`${newFieldName}:Banana`);
  await app.riskRegisterPage.table.expectRowCount(1);
  await app.riskRegisterPage.table.expectRowToContain(1, {
    'Risk name': 'Risk 1',
    [newFieldName]: ['Apple', 'Banana'],
  });

  // Test CONTAINS operator (:) for "Durian Fruit" - should match Risk 2 only
  await app.riskRegisterPage.table.clearFiltersButton.click();
  await app.riskRegisterPage.table.expectRowCount(2);

  await app.riskRegisterPage.table.setFilterInput(
    `${newFieldName}:Durian Fruit`
  );
  await app.riskRegisterPage.table.expectRowCount(1);
  await app.riskRegisterPage.table.expectRowToContain(1, {
    'Risk name': 'Risk 2',
    [newFieldName]: ['Durian Fruit'],
  });

  // Verify that both = and : operators are available and work consistently
  // Using = with "Durian Fruit" should also match Risk 2 (both operators work as contains)
  await app.riskRegisterPage.table.clearFiltersButton.click();
  await app.riskRegisterPage.table.expectRowCount(2);

  await app.riskRegisterPage.table.setFilterInput(
    `${newFieldName}=Durian Fruit`
  );
  await app.riskRegisterPage.table.expectRowCount(1);
  await app.riskRegisterPage.table.expectRowToContain(1, {
    'Risk name': 'Risk 2',
    [newFieldName]: ['Durian Fruit'],
  });
});

test(`Can make a custom field required`, async ({ page, app }) => {
  await page.goto('/');

  await app.riskRegisterPage.navigateToAndAssertTitle(true);
  await app.riskRegisterPage.addButton.click();
  await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);

  const riskForm = app.addRiskPage.detailsTab.riskForm;

  const newFieldName = 'Custom field';
  await app.customAttributeScenarios.addCustomAttribute(riskForm, {
    fieldType: 'Text',
    label: newFieldName,
    description: 'New Field Description 1',
  });
  await riskForm.formSettingsButton.openAndClickItem('Edit form');
  await app.customAttributeScenarios.editField(
    riskForm.getCustomField('Text', newFieldName),
    {
      required: true,
    }
  );
  await riskForm.saveFormConfigurationButton.click();
  await riskForm.saveButton.click();
  const error = await riskForm.getCustomField('Text', newFieldName).getError();
  expect(error).toEqual('Required');

  await riskForm.formSettingsButton.openAndClickItem('Edit form');
  await riskForm.getCustomField('Text', newFieldName).editFieldButton.click();
  const required =
    await app.editFieldModal.editFieldForm.fields.required.getValue();
  expect(required).toEqual(true);
});

test(`Can make a custom field hidden`, async ({ page, app }) => {
  await page.goto('/');

  await app.riskRegisterPage.navigateToAndAssertTitle(true);
  await app.riskRegisterPage.addButton.click();
  await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);

  const riskForm = app.addRiskPage.detailsTab.riskForm;

  const newFieldName = 'Custom field';
  await app.customAttributeScenarios.addCustomAttribute(riskForm, {
    fieldType: 'Text',
    label: newFieldName,
    description: 'New Field Description 1',
  });
  await riskForm.formSettingsButton.openAndClickItem('Edit form');
  await app.customAttributeScenarios.editField(
    riskForm.getCustomField('Text', newFieldName),
    {
      hidden: true,
    }
  );
  await riskForm.saveFormConfigurationButton.click();

  await riskForm.getCustomField('Text', newFieldName).expectIsVisible(false);

  await riskForm.formSettingsButton.openAndClickItem('Edit form');
  await riskForm.getCustomField('Text', newFieldName).editFieldButton.click();
  const hidden =
    await app.editFieldModal.editFieldForm.fields.hidden.getValue();
  expect(hidden).toEqual(true);
});

const conditionalFieldTestCases: {
  fieldType: CustomFieldTypes;
  value: string;
  operator: '=' | ':';
  options?: string[];
}[] = [
  {
    fieldType: 'Text',
    value: 'Car',
    operator: '=',
  },
  {
    fieldType: 'Dropdown',
    value: 'Car',
    operator: '=',
    options: ['Car', 'Motorcycle', 'Bicycle'],
  },
  {
    fieldType: 'Multiselect',
    value: 'Car',
    operator: ':',
    options: ['Car', 'Motorcycle', 'Bicycle'],
  },
];

conditionalFieldTestCases.forEach(({ fieldType, value, operator, options }) => {
  test(`Can make a customisable field conditional based on another ${fieldType} field`, async ({
    page,
    app,
  }) => {
    await updateOrganisationFeatures(['conditional_fields']);

    await page.goto('/');

    await app.riskRegisterPage.navigateToAndAssertTitle(true);
    await app.riskRegisterPage.addButton.click();
    await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);

    const riskForm = app.addRiskPage.detailsTab.riskForm;

    await app.customAttributeScenarios.addCustomAttribute(riskForm, {
      fieldType,
      label: 'Category',
      options,
    });
    await app.customAttributeScenarios.addCustomAttribute(riskForm, {
      fieldType: 'Text',
      label: 'Car make',
      conditions: {
        label: 'Category',
        operator,
        value,
      },
    });
    await riskForm.getCustomField(fieldType, 'Category').expectIsVisible(true);
    await riskForm.getCustomField('Text', 'Car make').expectIsVisible(false);

    await riskForm.fillForm({}, [
      {
        label: 'Category',
        type: fieldType,
        value,
      },
    ]);
    await riskForm.getCustomField('Text', 'Car make').expectIsVisible(true);

    await riskForm.fillForm({}, [
      {
        label: 'Category',
        type: fieldType,
        value: 'Motorcycle',
      },
    ]);
    await riskForm.getCustomField('Text', 'Car make').expectIsVisible(false);
  });
});

test(`Conditional fields not displayed if condition fields are not visible`, async ({
  page,
  app,
}) => {
  await updateOrganisationFeatures(['conditional_fields']);

  await page.goto('/');

  await app.riskRegisterPage.navigateToAndAssertTitle(true);
  await app.riskRegisterPage.addButton.click();
  await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);

  const riskForm = app.addRiskPage.detailsTab.riskForm;

  await app.customAttributeScenarios.addCustomAttribute(riskForm, {
    fieldType: 'Text',
    label: 'Category',
  });
  await app.customAttributeScenarios.addCustomAttribute(riskForm, {
    fieldType: 'Text',
    label: 'Car make',
    conditions: 'Category=Car',
  });
  await app.customAttributeScenarios.addCustomAttribute(riskForm, {
    fieldType: 'Text',
    label: 'Ford car model',
    conditions: 'Car make=Ford',
  });
  await riskForm.getCustomField('Text', 'Category').expectIsVisible(true);
  await riskForm.getCustomField('Text', 'Car make').expectIsVisible(false);
  await riskForm
    .getCustomField('Text', 'Ford car model')
    .expectIsVisible(false);

  await riskForm.fillForm({}, [
    {
      label: 'Category',
      type: 'Text',
      value: 'Car',
    },
    {
      label: 'Car make',
      type: 'Text',
      value: 'Ford',
    },
  ]);
  await riskForm.getCustomField('Text', 'Car make').expectIsVisible(true);
  await riskForm.getCustomField('Text', 'Ford car model').expectIsVisible(true);

  await riskForm.fillForm({}, [
    {
      label: 'Category',
      type: 'Text',
      value: 'Motorcycle',
    },
  ]);
  await riskForm.getCustomField('Text', 'Car make').expectIsVisible(false);
  await riskForm
    .getCustomField('Text', 'Ford car model')
    .expectIsVisible(false);

  await riskForm.fillForm({}, [
    {
      label: 'Category',
      type: 'Text',
      value: 'Car',
    },
  ]);
  const carMake = await riskForm.getCustomField('Text', 'Car make').getValue();
  // we don't lose previously entered value
  expect(carMake).toEqual('Ford');
});

test(`Conditional fields become unrequired when hidden`, async ({
  page,
  app,
}) => {
  await updateOrganisationFeatures(['conditional_fields']);

  await page.goto('/');

  await app.riskRegisterPage.navigateToAndAssertTitle(true);
  await app.riskRegisterPage.addButton.click();
  await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);

  const riskForm = app.addRiskPage.detailsTab.riskForm;

  await app.customAttributeScenarios.addCustomAttribute(riskForm, {
    fieldType: 'Text',
    label: 'Category',
  });
  await app.customAttributeScenarios.addCustomAttribute(riskForm, {
    fieldType: 'Text',
    label: 'Car make',
    required: true,
    conditions: 'Category=Car',
  });

  await riskForm.fillFormAndClickSave(buildRiskFormValues());
  await app.addRiskPage.notificationBanner.expectNotification(
    'Risk added successfully'
  );
});

test(`Conditionally hidden values are not saved`, async ({ page, app }) => {
  await updateOrganisationFeatures(['conditional_fields']);

  await page.goto('/');

  await app.riskRegisterPage.navigateToAndAssertTitle(true);
  await app.riskRegisterPage.addButton.click();
  await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);

  const riskForm = app.addRiskPage.detailsTab.riskForm;

  await app.customAttributeScenarios.addCustomAttribute(riskForm, {
    fieldType: 'Text',
    label: 'Category',
  });
  await app.customAttributeScenarios.addCustomAttribute(riskForm, {
    fieldType: 'Text',
    label: 'Car make',
    conditions: 'Category=Car',
  });
  const risk = buildRiskFormValues();
  await riskForm.fillForm(risk, [
    {
      label: 'Category',
      type: 'Text',
      value: 'Car',
    },
    {
      label: 'Car make',
      type: 'Text',
      value: 'Ford',
    },
  ]);
  await riskForm.fillFormAndClickSave({}, [
    {
      label: 'Category',
      type: 'Text',
      value: 'Motorcycle',
    },
  ]);
  await app.riskDetailsPage.notificationBanner.expectNotification(
    'Risk added successfully'
  );
  await expect(app.riskDetailsPage.header.title).toHaveText(risk.riskName);
  await riskForm.fillForm({}, [
    {
      label: 'Category',
      type: 'Text',
      value: 'Car',
    },
  ]);
  const carMakeField = await riskForm.getCustomField('Text', 'Car make');
  await carMakeField.expectIsVisible(true);
  const carMakeValue = await carMakeField.getValue();
  expect(carMakeValue).toEqual('');
});

test(`Cannot create circular conditions`, async ({ page, app }) => {
  await updateOrganisationFeatures(['conditional_fields']);

  await page.goto('/');

  await app.riskRegisterPage.navigateToAndAssertTitle(true);
  await app.riskRegisterPage.addButton.click();
  await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);

  const riskForm = app.addRiskPage.detailsTab.riskForm;

  await app.customAttributeScenarios.addCustomAttribute(riskForm, {
    label: 'Category',
    fieldType: 'Text',
  });
  await app.customAttributeScenarios.addCustomAttribute(riskForm, {
    fieldType: 'Text',
    label: 'Car make',
    conditions: 'Category=Car',
  });
  const categoryField = riskForm.getCustomField('Text', 'Category');
  await riskForm.formSettingsButton.openAndClickItem('Edit form');
  await categoryField.editFieldButton.click();
  await app.editFieldModal.editFieldForm.fillFormAndClickSave({
    conditions: 'Car make=Ford',
  });
  const errors = await app.editFieldModal.editFieldForm.getErrors();
  expect(errors).toEqual(
    expect.objectContaining({
      conditions:
        'Circular references detected in conditional logic. Please review and remove any circular references',
    })
  );
});

test(`Can set guidance for a standard field`, async ({ page, app }) => {
  await page.goto('/');

  await app.riskRegisterPage.navigateToAndAssertTitle(true);
  await app.riskRegisterPage.addButton.click();
  await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);

  const riskForm = app.addRiskPage.detailsTab.riskForm;

  await riskForm.formSettingsButton.openAndClickItem('Edit form');
  await expect(riskForm.fields.riskName.guidanceButton).toBeHidden();
  await app.customAttributeScenarios.editField(riskForm.fields.riskName, {
    enableCustomLabel: true,
    label: 'New risk title',
    description: 'New Field Description 1',
  });
  await riskForm.saveFormConfigurationButton.click();
  await expect(riskForm.fields.riskName.guidanceButton).toBeVisible();
  await riskForm.fields.riskName.guidanceButton.click();
  await expect(app.addRiskPage.helpPanel.helpSectionHeading).toHaveText(
    'New risk title'
  );
  await expect(app.addRiskPage.helpPanel.helpSectionContent).toHaveText(
    'New Field Description 1'
  );
});

test.describe('Can see taxonomy set guidence within edit field modal', () => {
  test.use({ user: users.customerSupport });
  test(users.customerSupport.role, async ({ page, app }) => {
    await page.goto('/');

    await app.taxonomyScenarios.addTaxonomy({
      risks: {
        fields: { title_help: 'My i18n help content' },
      },
    });

    await app.riskRegisterPage.navigateToAndAssertTitle(true);
    await app.riskRegisterPage.addButton.click();
    await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);

    const riskForm = app.addRiskPage.detailsTab.riskForm;

    await expect(riskForm.fields.riskName.guidanceButton).toBeVisible();
    await riskForm.fields.riskName.guidanceButton.click();
    await expect(app.addRiskPage.helpPanel.helpSectionHeading).toHaveText(
      'Risk name'
    );
    await expect(app.addRiskPage.helpPanel.helpSectionContent).toHaveText(
      'My i18n help content'
    );
    await riskForm.formSettingsButton.openAndClickItem('Edit form');
    await riskForm.fields.riskName.editFieldButton.click();
    await app.editFieldModal.editFieldForm.expectValues(
      expect.objectContaining({
        description: '<p>My i18n help content</p>',
        enableCustomLabel: false,
      })
    );
  });
});

test.describe('Can see taxonomy set "array based" guidence within edit field modal', () => {
  test.use({ user: users.customerSupport });
  test(users.customerSupport.role, async ({ page, app }) => {
    await page.goto('/');

    await app.taxonomyScenarios.addTaxonomy({
      risks: {
        fields: {
          title_help: [
            {
              title: 'Section 1 title',
              content: 'Section 1 content',
            },
            {
              title: 'Section 2 title',
              content: 'Section 2 content',
            },
          ],
        },
      },
    });

    await app.riskRegisterPage.navigateToAndAssertTitle(true);
    await app.riskRegisterPage.addButton.click();
    await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);

    const riskForm = app.addRiskPage.detailsTab.riskForm;

    await expect(riskForm.fields.riskName.guidanceButton).toBeVisible();
    await riskForm.fields.riskName.guidanceButton.click();
    await expect(app.addRiskPage.helpPanel.helpSectionHeading).toContainText(
      'Risk name'
    );
    await expect(app.addRiskPage.helpPanel.helpSectionContent).toContainText(
      'Section 1 title'
    );
    await expect(app.addRiskPage.helpPanel.helpSectionContent).toContainText(
      'Section 1 content'
    );
    await expect(app.addRiskPage.helpPanel.helpSectionContent).toContainText(
      'Section 2 title'
    );
    await expect(app.addRiskPage.helpPanel.helpSectionContent).toContainText(
      'Section 2 content'
    );
    await riskForm.formSettingsButton.openAndClickItem('Edit form');
    await riskForm.fields.riskName.editFieldButton.click();
    await app.editFieldModal.editFieldForm.expectValues(
      expect.objectContaining({
        description:
          '<div>\n' +
          '<div>\n' +
          '<h4>Section 1 title</h4>\n' +
          '<p>Section 1 content</p>\n' +
          '</div>\n' +
          '<div>\n' +
          '<h4>Section 2 title</h4>\n' +
          '<p>Section 2 content</p>\n' +
          '</div>\n' +
          '</div>',
        enableCustomLabel: false,
      })
    );
  });
});

test(`Deleted fields are removed from conditions`, async ({ page, app }) => {
  await updateOrganisationFeatures(['multi_reporting', 'conditional_fields']);

  await page.goto('/');

  await app.riskRegisterPage.navigateToAndAssertTitle(true);
  await app.riskRegisterPage.addButton.click();
  await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);

  const riskForm = app.addRiskPage.detailsTab.riskForm;

  const field1 = 'Field 1';
  await app.customAttributeScenarios.addCustomAttribute(riskForm, {
    fieldType: 'Text',
    label: field1,
    description: 'New Field Description 1',
  });
  const field2 = 'Field 2';
  await app.customAttributeScenarios.addCustomAttribute(riskForm, {
    fieldType: 'Text',
    label: field2,
    description: 'New Field Description 2',
    conditions: 'Field 1=test',
  });
  await riskForm.getCustomField('Text', field2).expectIsVisible(false);

  await riskForm.fillForm({}, [
    {
      type: 'Text',
      label: field1,
      value: 'test',
    },
  ]);

  // Condition  met so visible
  await riskForm.getCustomField('Text', field2).expectIsVisible(true);

  await riskForm.fillForm({}, [
    {
      type: 'Text',
      label: field1,
      value: 'another value',
    },
  ]);
  // Condition not met so hidden
  await riskForm.getCustomField('Text', field2).expectIsVisible(false);
  await riskForm.formSettingsButton.openAndClickItem('Edit form');
  await riskForm.getCustomField('Text', field1).editFieldButton.click();
  await app.customisableFieldModal.customisableFieldForm.deleteButton.click();
  await app.customisableFieldModal.deleteModal.confirmButton.click();
  await app.riskDetailsPage.notificationBanner.expectNotification(
    'Custom field deleted successfully'
  );
  await riskForm.saveFormConfigurationButton.click();
  // Condition removed, so should now be visible again
  await riskForm.getCustomField('Text', field2).expectIsVisible(true);
});

test('Can add conditions with standard field tags as source', async ({
  page,
  app,
}) => {
  await insertTagTypes([
    { Name: 'Tag 1', Description: 'Tag 1 description' },
    { Name: 'Tag 2', Description: 'Tag 2 description' },
  ]);
  await updateOrganisationFeatures(['conditional_fields']);

  await page.goto('/');

  await app.riskRegisterPage.navigateToAndAssertTitle(true);
  await app.riskRegisterPage.addButton.click();
  await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);

  const riskForm = app.addRiskPage.detailsTab.riskForm;

  await app.riskRegisterPage.navigateToAndAssertTitle(true);
  await app.riskRegisterPage.addButton.click();
  await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);

  await riskForm.fields.departments.expectIsVisible(true);
  await riskForm.formSettingsButton.openAndClickItem('Edit form');
  await app.customAttributeScenarios.editField(riskForm.fields.departments, {
    conditions: {
      label: 'Tags',
      type: 'dropdown',
      operator: ':',
      value: 'Tag 1',
    },
  });
  await riskForm.saveFormConfigurationButton.click();
  await riskForm.fields.departments.expectIsVisible(false);
  await riskForm.fillForm({
    tags: ['Tag 1'],
  });
  await riskForm.fields.departments.expectIsVisible(true);

  await riskForm.fillForm({
    tags: ['Tag 2'],
  });
  await riskForm.fields.departments.expectIsVisible(false);
});

test('Can add conditions with standard field departments as source', async ({
  page,
  app,
}) => {
  await insertDepartmentTypes([
    { Name: 'Department 1', Description: 'Department 1 description' },
    { Name: 'Department 2', Description: 'Department 2 description' },
  ]);
  await updateOrganisationFeatures(['conditional_fields']);

  await page.goto('/');

  await app.riskRegisterPage.navigateToAndAssertTitle(true);
  await app.riskRegisterPage.addButton.click();
  await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);

  const riskForm = app.addRiskPage.detailsTab.riskForm;

  await app.riskRegisterPage.navigateToAndAssertTitle(true);
  await app.riskRegisterPage.addButton.click();
  await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);

  await riskForm.fields.tags.expectIsVisible(true);
  await riskForm.formSettingsButton.openAndClickItem('Edit form');
  await app.customAttributeScenarios.editField(riskForm.fields.tags, {
    conditions: {
      label: 'Departments',
      type: 'dropdown',
      operator: ':',
      value: 'Department 1',
    },
  });
  await riskForm.saveFormConfigurationButton.click();
  await riskForm.fields.tags.expectIsVisible(false);
  await riskForm.fillForm({
    departments: ['Department 1'],
  });
  await riskForm.fields.tags.expectIsVisible(true);

  await riskForm.fillForm({
    departments: ['Department 2'],
  });
  await riskForm.fields.tags.expectIsVisible(false);
});

test('Can add conditions with standard field owners as source', async ({
  page,
  app,
}) => {
  await updateOrganisationFeatures(['conditional_fields']);

  await page.goto('/');

  await app.riskRegisterPage.navigateToAndAssertTitle(true);
  await app.riskRegisterPage.addButton.click();
  await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);

  const riskForm = app.addRiskPage.detailsTab.riskForm;

  await app.riskRegisterPage.navigateToAndAssertTitle(true);
  await app.riskRegisterPage.addButton.click();
  await expect(app.addRiskPage.header.title).toHaveText(`Add Risk`);

  await riskForm.fields.tags.expectIsVisible(true);
  await riskForm.formSettingsButton.openAndClickItem('Edit form');
  await app.customAttributeScenarios.editField(riskForm.fields.tags, {
    conditions: {
      label: 'Owner',
      type: 'dropdown',
      operator: ':',
      value: users.public.friendlyName,
    },
  });
  await riskForm.saveFormConfigurationButton.click();
  await riskForm.fields.tags.expectIsVisible(false);
  await riskForm.fillForm({
    owners: [users.public.friendlyName],
  });
  await riskForm.fields.tags.expectIsVisible(true);

  await riskForm.fillForm({
    owners: [users.standard.friendlyName],
  });
  await riskForm.fields.tags.expectIsVisible(false);
});
