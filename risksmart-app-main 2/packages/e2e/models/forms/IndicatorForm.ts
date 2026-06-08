import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';

import type { TestScheduleValues } from '../components/TestScheduleForm';
import { getTestScheduleFormFields } from '../components/TestScheduleForm';
import { BaseForm } from './BaseForm';
import { FileInput } from './fields/FileInput';
import { Input } from './fields/Input';
import { MultiSelect } from './fields/MultiSelect';
import { NumberInput } from './fields/NumberInput';
import { Select } from './fields/Select';
import { TextArea } from './fields/TextArea';

export type IndicatorFormValues = {
  name: string;
  details: string;
  owners: string[];
  contributors: string[];
  indicatorType: string;
  unit: string;
  lowerTolerance: number;
  lowerAppetite: number;
  upperAppetite: number;
  upperTolerance: number;
  tags: [];
  departments: string[];
  attachFiles: string[];
} & TestScheduleValues;

export class IndicatorForm extends BaseForm<IndicatorFormValues> {
  constructor(page: Page | Locator) {
    super(page);

    this.fields = {
      name: new Input(page, 'name'),
      indicatorType: new Select(page, 'type'),
      unit: new Input(page, 'unit'),
      lowerTolerance: new NumberInput(page, 'lowerTolerance'),
      lowerAppetite: new NumberInput(page, 'lowerAppetite'),
      upperAppetite: new NumberInput(page, 'upperAppetite'),
      upperTolerance: new NumberInput(page, 'upperTolerance'),
      owners: new MultiSelect(page, 'indicatorFrom-owners'),
      details: new TextArea(page, 'description'),
      contributors: new MultiSelect(page, 'contributors'),
      tags: new MultiSelect(page, 'tags'),
      departments: new MultiSelect(page, 'departments'),
      attachFiles: new FileInput(page, 'files'),
      ...getTestScheduleFormFields(page),
    };
  }
}
