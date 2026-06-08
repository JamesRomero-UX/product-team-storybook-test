import { type Page } from '@playwright/test';

import type { ActionFormFields, Status } from './ActionForm';
import { BaseForm } from './BaseForm';
import { DateInput } from './fields/DateInput';
import { FileInput } from './fields/FileInput';
import { Input } from './fields/Input';
import { MultiSelect } from './fields/MultiSelect';
import { RadioGroup } from './fields/RadioGroup';
import { Select } from './fields/Select';
import { TextArea } from './fields/TextArea';
import type { IssueFormFields } from './IssueForm';
import type { RatingFormFields } from './RatingForm';

export type FindingFormFields = RatingFormFields &
  IssueFormFields &
  ActionFormFields & {
    type: string;
    ratingType: string;
    risks: string[];
    attachFiles: string[];
  };

export class FindingForm extends BaseForm<FindingFormFields> {
  constructor(page: Page) {
    super(page);

    this.fields = {
      // Finding form fields
      type: new Select(page, 'type'),
      ratingType: new Select(page, 'ratingType'),
      risks: new MultiSelect(page, 'risk'),
      // Common fields for all forms
      title: new Input(page, 'title'),
      tags: new MultiSelect(page, 'tags'),
      attachFiles: new FileInput(page, 'attachFiles'),
      assessments: new MultiSelect(page, 'assessment'),
      rationale: new TextArea(page, 'rationale'),

      // Action form fields

      description: new TextArea(page, 'description'),
      owners: new MultiSelect(page, 'owners'),
      contributors: new MultiSelect(page, 'contributors'),
      departments: new MultiSelect(page, 'departments'),
      priority: new Select(page, 'priority'),
      dateRaised: new DateInput(page, 'dateRaised'),
      targetCloseDate: new DateInput(page, 'targetCloseDate'),
      status: new RadioGroup<Status>(page, 'status'),
      closedDate: new DateInput(page, 'closedDate'),
      likelihood: new Select(page, 'likelihood'),
      impact: new Select(page, 'impact'),
      rating: new Select(page, 'rating'),
      resultDate: new DateInput(page, 'resultDate'),

      // Issue form fields
      impactsCustomer: new RadioGroup<'true' | 'false'>(
        page,
        'impactsCustomer'
      ),
      isExternalIssue: new RadioGroup<'true' | 'false'>(
        page,
        'isExternalIssue'
      ),
      details: new TextArea(page, 'details'),
      dateOccurred: new DateInput(page, 'dateOccurred'),
      dateIdentified: new DateInput(page, 'dateIdentified'),

      controlType: new Select(page, 'controlType'),
    };
  }
}
