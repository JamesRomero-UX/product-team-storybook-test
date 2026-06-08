import { type Page } from '@playwright/test';

import { BaseForm } from './BaseForm';
import { Select } from './fields/Select';

export type CustomDatasourceSettingsFormValues = {
  dataSource: string;
  chartType: string;
  category: string;
  aggregationType: string;
};

export class CustomDatasourceSettingsForm extends BaseForm<CustomDatasourceSettingsFormValues> {
  constructor(page: Page) {
    super(page);
    this.fields = {
      dataSource: new Select(page, 'dataSource'),
      chartType: new Select(page, 'chartType'),
      category: new Select(page, 'category'),
      aggregationType: new Select(page, 'aggregationType'),
    };
  }
}
