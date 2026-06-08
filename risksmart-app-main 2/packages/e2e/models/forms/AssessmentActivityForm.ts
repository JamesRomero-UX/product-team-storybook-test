import { type Page } from '@playwright/test';

import { BaseForm } from './BaseForm';
import { DateInput } from './fields/DateInput';
import { FileInput } from './fields/FileInput';
import { Input } from './fields/Input';
import { RadioGroup } from './fields/RadioGroup';
import { Select } from './fields/Select';
import { TextArea } from './fields/TextArea';

export type AssessmentActivityFormFields = {
  title: string;
  activityType: string;
  summary: string;
  activityUser: string;
  completionDate: string;
  status: string;
  attachFiles: string[];
};

export class AssessmentActivityForm extends BaseForm<AssessmentActivityFormFields> {
  constructor(page: Page) {
    super(page);
    this.fields = {
      title: new Input(page, 'title'),
      activityType: new Select(page, 'ActivityType'),
      summary: new TextArea(page, 'summary'),
      activityUser: new Select(page, 'ActivityUser'),
      status: new RadioGroup(page, 'Status'),
      completionDate: new DateInput(page, 'completionDate'),
      attachFiles: new FileInput(page, 'attachFiles'),
    };
  }
}
