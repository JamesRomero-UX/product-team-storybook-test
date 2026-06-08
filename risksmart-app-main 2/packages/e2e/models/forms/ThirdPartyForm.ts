import { type Page } from '@playwright/test';

import { BaseForm } from './BaseForm';
import { FileInput } from './fields/FileInput';
import { Input } from './fields/Input';
import { MultiSelect } from './fields/MultiSelect';
import { RadioGroup } from './fields/RadioGroup';
import { Select } from './fields/Select';
import { TextArea } from './fields/TextArea';

export type ThirdPartyFormValues = {
  title: string;
  description: string;
  companyName: string;
  companiesHouseNumber: string;
  primaryContactName: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
  email: string;
  companyDomain: string;
  contactName: string;
  type: string;
  status: string;
  criticality: string;
  owners: string[];
  contributors: string[];
  tags: string[];
  departments: string[];
  attachFiles: string[];
};

export class ThirdPartyForm extends BaseForm<ThirdPartyFormValues> {
  constructor(page: Page) {
    super(page);

    this.fields = {
      title: new Input(page, 'title'),
      primaryContactName: new Input(page, 'primaryContactName'),
      description: new TextArea(page, 'description'),
      companyName: new Input(page, 'companyName'),
      companiesHouseNumber: new Input(page, 'companiesHouseNumber'),
      address: new Input(page, 'address'),
      city: new Input(page, 'cityTown'),
      postcode: new Input(page, 'postcode'),
      country: new Input(page, 'country'),
      email: new Input(page, 'contactEmail'),
      companyDomain: new Input(page, 'companyDomain'),
      contactName: new Input(page, 'contactName'),
      type: new RadioGroup<string>(page, 'type'),
      status: new Select<string>(page, 'status'),
      criticality: new Select<string>(page, 'criticality'),
      owners: new MultiSelect(page, 'owners'),
      contributors: new MultiSelect(page, 'contributors'),
      tags: new MultiSelect(page, 'tags'),
      departments: new MultiSelect(page, 'departments'),
      attachFiles: new FileInput(page, 'attachFiles'),
    };
  }
}
