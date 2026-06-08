import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';

import { BaseForm } from './BaseForm';
import { DateInput } from './fields/DateInput';
import { FileInput } from './fields/FileInput';
import { Input } from './fields/Input';
import { MultiSelect } from './fields/MultiSelect';
import { Select } from './fields/Select';
import { TextArea } from './fields/TextArea';

export type TestResultFormValues = {
  controls: string[];
  testType: string;
  title: string;
  controlTestDetails: string;
  testDate: string;
  performedBy: string;
  testResult: string;
  files: string[];
  designEffectiveness: string;
  performanceEffectiveness: string;
};

export class TestResultForm extends BaseForm<TestResultFormValues> {
  constructor(parent: Page | Locator) {
    super(parent);
    this.fields = {
      controls: new MultiSelect(parent, 'controls'),
      testType: new Select(parent, 'testType'),
      title: new Input(parent, 'title'),
      controlTestDetails: new TextArea(parent, 'description'),
      testDate: new DateInput(parent, 'testDate'),
      performedBy: new Select(parent, 'performedBy'),
      testResult: new Select(parent, 'overallEffectiveness'),
      files: new FileInput(parent, 'attachFiles'),
      designEffectiveness: new Select(parent, 'designEffectiveness'),
      performanceEffectiveness: new Select(parent, 'performanceEffectiveness'),
    };
  }
}
