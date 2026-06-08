import { type Page } from '@playwright/test';

import type { TestScheduleValues } from '../components/TestScheduleForm';
import { getTestScheduleFormFields } from '../components/TestScheduleForm';
import { BaseForm } from './BaseForm';
import { AutosuggestInput } from './fields/AutosuggestInput';
import { MultiSelect } from './fields/MultiSelect';
import { RadioGroup } from './fields/RadioGroup';
import { Select } from './fields/Select';
import { TextArea } from './fields/TextArea';

export type Treatment = '-' | 'Terminate' | 'Tolerate' | 'Transfer' | 'Treat';
export type Status = '-' | 'Active' | 'Emerging' | 'Monitored' | 'Retired';

export type RiskFormValues = {
  riskName: string;
  description: string;
  owners: string[];
  contributors: string[];
  tags: string[];
  departments: string[];
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  status: Status;
  treatment: Treatment;
  parentRiskTitle: string | undefined;
} & TestScheduleValues;

export class RiskForm extends BaseForm<RiskFormValues> {
  constructor(page: Page) {
    super(page.getByTestId('risk-form'));

    this.fields = {
      ...getTestScheduleFormFields(page),
      riskName: new AutosuggestInput(page, 'riskForm-name'),
      description: new TextArea(page, 'riskForm-description'),
      owners: new MultiSelect(page, 'riskForm-owners'),
      contributors: new MultiSelect(page, 'riskForm-contributors'),
      tags: new MultiSelect(page, 'riskForm-tags'),
      departments: new MultiSelect(page, 'riskForm-departments'),
      tier: new RadioGroup(page, 'riskForm-tier'),
      treatment: new Select<Treatment>(page, 'riskForm-treatment'),
      status: new Select<Status>(page, 'riskForm-status'),
      parentRiskTitle: new Select(page, 'riskForm-parentRiskId'),
    };
  }
}
