import type { FC } from 'react';
import { SelectWithFormField } from 'src/components/form/controlled-select/SelectWithFormField';
import type { OptionWithColor } from 'src/components/form/form-utils';

import type { CustomAttributeProps } from './CustomAttributeProps';

type SelectEnumSchema = {
  enum?: string[];
};

type SelectOneOfSchema = {
  oneOf?: { const?: string; title?: string }[];
};

interface CustomAttributeSelectProps extends CustomAttributeProps {
  schema: SelectEnumSchema | SelectOneOfSchema;
}

const isSelectEnumSchema = (
  schema: SelectEnumSchema | SelectOneOfSchema
): schema is Required<SelectEnumSchema> => {
  return 'enum' in schema;
};

const isSelectOneOfSchema = (
  schema: SelectEnumSchema | SelectOneOfSchema
): schema is Required<SelectOneOfSchema> => {
  return 'oneOf' in schema;
};

const emptyOption: OptionWithColor = {
  value: '',
  label: '-',
  color: 'light-grey',
};

export const CustomAttributeSelect: FC<CustomAttributeSelectProps> = ({
  label,
  onChange,
  value,
  disabled,
  error,
  schema,
  description,
}) => {
  let selectOptions: {
    value: string;
    label: string;
    disabled: boolean;
  }[] = [];

  if (isSelectEnumSchema(schema)) {
    selectOptions = schema.enum.map((item) => ({
      value: item,
      label: item,
      disabled: false,
    }));
  } else if (isSelectOneOfSchema(schema)) {
    selectOptions = schema.oneOf.map((item) => ({
      value: item.const ?? '',
      label: item.title ?? '',
      disabled: false,
    }));
  } else {
    console.warn('Unsupported schema type for CustomAttributeSelect');
  }

  return (
    <SelectWithFormField
      testId={label}
      description={description}
      label={label}
      onChange={(value) =>
        value ? onChange(value.toString()) : onChange(null)
      }
      value={value}
      options={[emptyOption, ...selectOptions]}
      disabled={disabled}
      placeholder={'Select'}
      errorMessage={error}
    />
  );
};
