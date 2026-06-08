import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';

import { BaseForm } from './BaseForm';
import { DateInput } from './fields/DateInput';
import { FileInput } from './fields/FileInput';
import { Input } from './fields/Input';
import { MultiSelect } from './fields/MultiSelect';
import { RadioGroup } from './fields/RadioGroup';
import { Select } from './fields/Select';
import { TextArea } from './fields/TextArea';

export type Status = 'Pending' | 'Closed' | 'Open';

export type ActionFormFields = {
  title: string;
  description: string;
  owners: string[];
  contributors: string[];
  priority: string;
  targetCloseDate: string;
  dateRaised: string;
  closedDate: string;
  tags: string[];
  departments: string[];
  status: Status;
  attachFiles: string[];
};

export class ActionForm extends BaseForm<ActionFormFields> {
  constructor(page: Page | Locator, parentSelector?: string) {
    super(page);

    this.fields = {
      title: new Input(page, 'title', parentSelector),
      description: new TextArea(page, 'description', parentSelector),
      owners: new MultiSelect(page, 'owners', true, parentSelector),
      contributors: new MultiSelect(page, 'contributors', true, parentSelector),
      priority: new Select(page, 'priority', parentSelector),
      dateRaised: new DateInput(page, 'dateRaised', parentSelector),
      targetCloseDate: new DateInput(page, 'targetCloseDate', parentSelector),
      status: new RadioGroup<Status>(page, 'status', parentSelector),
      closedDate: new DateInput(page, 'closedDate', parentSelector),
      tags: new MultiSelect(page, 'tags', true, parentSelector),
      departments: new MultiSelect(page, 'departments', true, parentSelector),
      attachFiles: new FileInput(page, 'attachFiles', parentSelector),
    };
  }
}
