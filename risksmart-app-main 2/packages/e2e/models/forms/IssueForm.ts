import { type Page } from '@playwright/test';

import { BaseForm } from './BaseForm';
import { DateInput } from './fields/DateInput';
import { FileInput } from './fields/FileInput';
import { Input } from './fields/Input';
import { MultiSelect } from './fields/MultiSelect';
import { RadioGroup } from './fields/RadioGroup';
import { TextArea } from './fields/TextArea';

export type IssueFormFields = {
  title: string;
  details: string;
  dateIdentified: string;
  dateOccurred: string;
  impactsCustomer: 'Yes' | 'No';
  isExternalIssue: 'External' | 'Internal';
  owners: string[];
  contributors: string[];
  attachFiles: string[];
  tags: string[];
  departments: string[];
};

export class IssueForm extends BaseForm<IssueFormFields> {
  constructor(page: Page) {
    super(page);

    this.fields = {
      title: new Input(page, 'title'),
      details: new TextArea(page, 'details'),
      impactsCustomer: new RadioGroup<'Yes' | 'No'>(page, 'impactsCustomer'),
      isExternalIssue: new RadioGroup<'External' | 'Internal'>(
        page,
        'isExternalIssue'
      ),
      dateIdentified: new DateInput(page, 'dateIdentified'),
      dateOccurred: new DateInput(page, 'dateOccurred'),
      owners: new MultiSelect(page, 'owners'),
      contributors: new MultiSelect(page, 'contributors'),
      attachFiles: new FileInput(page, 'attachFiles'),
      tags: new MultiSelect(page, 'tags'),
      departments: new MultiSelect(page, 'departments'),
    };
  }
}
