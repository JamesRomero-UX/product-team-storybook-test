import type {
  InsertFormFieldInput,
  UpdateFormFieldInput,
} from '../generated/graphql';

const insertFormFieldInput: InsertFormFieldInput = {
  Hidden: false,
  Label: 'New field 1',
  Options: [],
  ParentType: 'action',
  ReadOnly: false,
  Required: false,
  Type: 'text',
  IsCustomField: true,
};

export const buildInsertFormFieldApi = (
  overrides: Partial<InsertFormFieldInput> = {}
): InsertFormFieldInput => {
  return {
    ...insertFormFieldInput,
    ...overrides,
  };
};

const updateFormFieldInput: UpdateFormFieldInput = {
  Hidden: false,
  Label: 'New field 1',
  Options: [],
  ParentType: 'action',
  ReadOnly: false,
  Required: false,
  FieldId: '',
  IsCustomField: false,
};

export const buildUpdateFormFieldApi = (
  overrides: Partial<UpdateFormFieldInput> = {}
): UpdateFormFieldInput => {
  return {
    ...updateFormFieldInput,
    FieldId: '',
    ...overrides,
  };
};
