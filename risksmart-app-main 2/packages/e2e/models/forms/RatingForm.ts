import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';

import { BaseForm } from './BaseForm';
import { DateInput } from './fields/DateInput';
import { FileInput } from './fields/FileInput';
import { MultiSelect } from './fields/MultiSelect';
import { Select } from './fields/Select';
import { TextArea } from './fields/TextArea';

export type RatingFormFields = {
  impact: string;
  likelihood: string;
  rating: string;
  resultDate: string;
  controlType: string;
  attachFiles: string[];
  risks: string[];
  assessments: string[];
  rationale: string;
};

export class RatingForm extends BaseForm<RatingFormFields> {
  constructor(page: Page | Locator) {
    super(page);
    this.fields = {
      impact: new Select(page, 'impact'),
      likelihood: new Select(page, 'likelihood'),
      rating: new Select(page, 'rating'),
      resultDate: new DateInput(page, 'resultDate'),
      controlType: new Select(page, 'controlType'),
      attachFiles: new FileInput(page, 'attachFiles'),
      risks: new MultiSelect(page, 'risk'),
      assessments: new MultiSelect(page, 'assessment'),
      rationale: new TextArea(page, 'rationale'),
    };
  }
}
