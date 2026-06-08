import { type Page } from '@playwright/test';

import { BaseForm } from './BaseForm';
import { Input } from './fields/Input';
import { MultiSelect } from './fields/MultiSelect';

export type QuestionnaireFormValues = {
  title: string;
  owners: string[];
};

export class QuestionnaireForm extends BaseForm<QuestionnaireFormValues> {
  constructor(page: Page) {
    super(page);

    this.fields = {
      title: new Input(page, 'title'),
      owners: new MultiSelect(page, 'owners'),
    };
  }
}
