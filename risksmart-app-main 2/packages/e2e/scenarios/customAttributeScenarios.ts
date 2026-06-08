import { expect, type Page } from '@playwright/test';

import type { AddCustomFieldFormValues } from '../models/forms/AddCustomFieldForm';
import type { BaseForm, FormsFields } from '../models/forms/BaseForm';
import type { CustomisableField } from '../models/forms/fields/CustomisableField';
import type { NewFieldFormValues } from '../models/forms/NewFieldForm';
import { AddCustomFieldModal } from '../models/modals/AddCustomFieldModal';
import { EditFieldModal } from '../models/modals/EditFieldModal';
import { NotificationBanner } from '../models/NotificationBanner';

export class CustomAttributeScenarios {
  readonly page: Page;
  readonly addCustomFieldModal: AddCustomFieldModal;
  readonly notificationBanner: NotificationBanner;
  readonly editFieldModal: EditFieldModal;

  constructor(page: Page) {
    this.page = page;
    this.addCustomFieldModal = new AddCustomFieldModal(page);
    this.notificationBanner = new NotificationBanner(page);
    this.editFieldModal = new EditFieldModal(page);
  }

  /**
   * Add a custom attribute
   */
  async addCustomAttribute<T extends FormsFields>(
    form: BaseForm<T>,
    value: Partial<AddCustomFieldFormValues>
  ) {
    await form.formSettingsButton.openAndClickItem('Add custom field');
    await expect(this.addCustomFieldModal.modalLocator).toBeVisible();
    await expect(this.addCustomFieldModal.header).toHaveText(
      'Add custom field'
    );
    await this.addCustomFieldModal.addCustomFieldForm.fillFormAndClickSave(
      value
    );

    await this.notificationBanner.expectNotification(
      'Custom field added successfully'
    );
  }

  /**
   * Edit a field whilst in "Edit form" mode
   * @param field Editable field
   * @param values New field values
   */
  async editField(
    field: CustomisableField,
    values: Partial<NewFieldFormValues>
  ) {
    await field.editFieldButton.click();
    await this.editFieldModal.editFieldForm.fillFormAndClickSave(values);
    await this.notificationBanner.expectNotification(
      'Custom field updated successfully'
    );
  }

  async bulkEditFields<T extends FormsFields>(
    form: BaseForm<T>,
    fieldValues: {
      field: CustomisableField;
      values: Partial<NewFieldFormValues>;
    }[]
  ) {
    await form.formSettingsButton.openAndClickItem('Edit form');
    for (const { field, values } of fieldValues) {
      await field.editFieldButton.click();
      await this.editFieldModal.editFieldForm.fillFormAndClickSave(values);
      await this.notificationBanner.expectNotification(
        'Custom field updated successfully'
      );
    }
    await form.saveFormConfigurationButton.click();
  }
}
