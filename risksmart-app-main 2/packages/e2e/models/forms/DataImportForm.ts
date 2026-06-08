import { type Page } from '@playwright/test';

import { BaseForm } from './BaseForm';
import { FileInput } from './fields/FileInput';

export type DataImportFormValues = {
  selectFilesButton: string[];
};

export class DataImportForm extends BaseForm<DataImportFormValues> {
  constructor(page: Page) {
    super(page);
    this.fields = {
      selectFilesButton: new FileInput(page, 'attachFiles'),
    };
  }
}
