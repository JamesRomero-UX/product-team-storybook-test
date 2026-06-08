import { type Page } from '@playwright/test';

import { BaseForm } from './BaseForm';
import { DateInput } from './fields/DateInput';
import { Input } from './fields/Input';
import { MultiSelect } from './fields/MultiSelect';
import { RadioGroup } from './fields/RadioGroup';
import { Select } from './fields/Select';
import { TextArea } from './fields/TextArea';

export type InternalAuditReportFormFields = {
  title: string;
  summary: string;
  completedBy: string;
  startDate: string;
  targetCompletionDate: string;
  actualCompletionDate: string;
  nextAssessmentDate: string;
  assessmentOutcome: string;
  status: string;
  owners: string[];
  contributors: string[];
  tags: string[];
  departments: string[];
};

export class InternalAuditReportForm extends BaseForm<InternalAuditReportFormFields> {
  constructor(page: Page) {
    super(page);
    this.fields = {
      title: new Input(page, 'title'),
      summary: new TextArea(page, 'summary'),
      completedBy: new Select(page, 'completedByUser'),
      startDate: new DateInput(page, 'startDate'),
      targetCompletionDate: new DateInput(page, 'targetCompletionDate'),
      actualCompletionDate: new DateInput(page, 'actualCompletionDate'),
      nextAssessmentDate: new DateInput(page, 'nextTestDate'),
      status: new RadioGroup(page, 'status'),
      assessmentOutcome: new Select(page, 'assessmentOutcome'),
      owners: new MultiSelect(page, 'owners'),
      contributors: new MultiSelect(page, 'contributors'),
      tags: new MultiSelect(page, 'tags'),
      departments: new MultiSelect(page, 'departments'),
    };
  }
}
