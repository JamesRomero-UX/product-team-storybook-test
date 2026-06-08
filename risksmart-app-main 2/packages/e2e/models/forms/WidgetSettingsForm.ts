import { type Page } from '@playwright/test';

import { BaseForm } from './BaseForm';
import { PropertyFilter } from './fields/PropertyFilter';
import { Select } from './fields/Select';

export type WidgetSettingsFormValues = {
  dataSource: string;
  chartType: string;
  category: string;
  filtering?: string;
};

export class WidgetSettingsForm extends BaseForm<WidgetSettingsFormValues> {
  constructor(page: Page) {
    super(page);
    this.fields = {
      dataSource: new Select(page, 'dataSource'),
      chartType: new Select(page, 'chartType'),
      category: new Select(page, 'category'),
      filtering: new PropertyFilter(page, 'filtering'),
    };
  }
}
