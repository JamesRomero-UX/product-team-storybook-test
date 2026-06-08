import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';
import type { FileUploadWrapper } from '@risk-smart/themed-cloudscape-components/test-utils/selectors';

import type { FormFieldValue } from '../BaseForm';
import { CustomisableField } from './CustomisableField';

export class FileInput extends CustomisableField {
  readonly chooseFilesButton: Locator;
  readonly fileUploadWrapper: FileUploadWrapper;
  readonly page: Page | Locator;

  constructor(page: Page | Locator, testId: string, parentSelector?: string) {
    super(page, testId, parentSelector);
    this.page = page;
    this.fileUploadWrapper = this.formFieldWrapper
      .findControl()
      .findFileUpload();
    this.chooseFilesButton = page.locator(
      this.fileUploadWrapper.findUploadButton().toSelector()
    );
  }

  async isDisabled(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async setFiles(files: string[]) {
    const uploadPromise = (
      'page' in this.page ? this.page.page() : this.page
    ).waitForEvent('filechooser');
    await this.chooseFilesButton.click();
    const fileChooser = await uploadPromise;
    await fileChooser.setFiles(files);
  }

  setValue(value: string | string[]): Promise<void> {
    return this.setFiles(typeof value === 'string' ? [value] : value);
  }
  async getValue(): Promise<FormFieldValue> {
    const fileNames = await this.formField
      .locator("[data-testid='file-list-file-item'] [data-testid='file-name']")
      .all();

    // innerText() returns string[]; FormFieldValue includes string[] as a member — assertion documents the intent.
    return (await Promise.all(
      fileNames.map((fileName) => fileName.innerText())
    )) as FormFieldValue;
  }
}
