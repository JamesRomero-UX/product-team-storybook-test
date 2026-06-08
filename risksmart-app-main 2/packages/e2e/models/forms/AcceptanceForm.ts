import { type Page } from '@playwright/test';

import { BaseForm } from './BaseForm';
import { DateInput } from './fields/DateInput';
import { FileInput } from './fields/FileInput';
import { Input } from './fields/Input';
import { RadioGroup } from './fields/RadioGroup';
import { Select } from './fields/Select';
import { TextArea } from './fields/TextArea';

export type AcceptanceFormFields = {
  title: string;
  dateAcceptedFrom: string;
  dateAcceptedTo: string;
  requestedBy: string;
  approvedBy: string;
  status: AcceptanceStatus;
  details: string;
  attachFiles: string[];
};

type AcceptanceStatus = 'Open' | 'Draft' | 'Closed';

export class AcceptanceForm extends BaseForm<AcceptanceFormFields> {
  constructor(page: Page) {
    super(page);

    this.fields = {
      title: new Input(page, 'title'),
      dateAcceptedFrom: new DateInput(page, 'dateAcceptedFrom'),
      dateAcceptedTo: new DateInput(page, 'dateAcceptedTo'),
      requestedBy: new Select(page, 'requestedBy'),
      approvedBy: new Select(page, 'approvedBy'),
      status: new RadioGroup<AcceptanceStatus>(page, 'status'),
      details: new TextArea(page, 'details'),
      attachFiles: new FileInput(page, 'attachFiles'),
    };
  }
}
