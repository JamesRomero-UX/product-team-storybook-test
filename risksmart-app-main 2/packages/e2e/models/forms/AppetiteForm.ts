import { type Page } from '@playwright/test';

import { BaseForm } from './BaseForm';
import { DateInput } from './fields/DateInput';
import { FileInput } from './fields/FileInput';
import { Select } from './fields/Select';
import { TextArea } from './fields/TextArea';

export type AppetiteFormFields = {
  effectiveDate: string;
  appetiteType: string;
  appetiteStatement: string;
  impact: string;
  impactAppetite: string;
  lowerAppetite: string;
  upperAppetite: string;
  files: string[];
};

export class AppetiteForm extends BaseForm<AppetiteFormFields> {
  constructor(page: Page) {
    super(page);

    this.fields = {
      effectiveDate: new DateInput(page, 'effectiveDate'),
      appetiteType: new Select(page, 'appetiteType'),
      appetiteStatement: new TextArea(page, 'appetiteStatement'),
      impact: new Select(page, 'impact'),
      impactAppetite: new Select(page, 'impactAppetite'),
      lowerAppetite: new Select(page, 'lowerAppetite'),
      upperAppetite: new Select(page, 'upperAppetite'),
      files: new FileInput(page, 'attachFiles'),
    };
  }
}
