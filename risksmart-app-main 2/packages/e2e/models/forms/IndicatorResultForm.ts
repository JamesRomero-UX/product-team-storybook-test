import { type Page } from '@playwright/test';

import { BaseForm } from './BaseForm';
import { DateInput } from './fields/DateInput';
import { Input } from './fields/Input';
import { TextArea } from './fields/TextArea';

export type IndicatorResultFormValues = {
  result: string;
  date: string;
  details: string;
};

export class IndicatorResultForm extends BaseForm<IndicatorResultFormValues> {
  constructor(page: Page) {
    super(page);

    this.fields = {
      result: new Input(page, 'result'),
      date: new DateInput(page, 'resultDate'),
      details: new TextArea(page, 'description'),
    };
  }
}
