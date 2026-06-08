import type { FC } from 'react';
import { MultiSelect } from 'src/components/form/controlled-multiselect/ControlledMultiselect';

import type { CustomAttributeProps } from './CustomAttributeProps';

type MultiSelectEnumSchema = {
  enum?: string[];
};

type MultiSelectOneOfSchema = {
  oneOf?: { const?: string; title?: string }[];
};
interface CustomAttributeMultiSelectProps extends CustomAttributeProps<
  null | string[]
> {
  schema: MultiSelectEnumSchema | MultiSelectOneOfSchema;
}

const isMultiSelectEnumSchema = (
  schema: MultiSelectEnumSchema | MultiSelectOneOfSchema
): schema is Required<MultiSelectEnumSchema> => {
  return 'enum' in schema;
};

const isMultiSelectOneOfSchema = (
  schema: MultiSelectEnumSchema | MultiSelectOneOfSchema
): schema is Required<MultiSelectOneOfSchema> => {
  return 'oneOf' in schema;
};

export const CustomAttributeMultiSelect: FC<
  CustomAttributeMultiSelectProps
> = ({ label, onChange, value, disabled, error, schema, description }) => {
  let multiselectOptions: {
    value: string;
    label: string;
    disabled: boolean;
  }[] = [];

  if (isMultiSelectEnumSchema(schema)) {
    multiselectOptions = schema.enum.map((item) => ({
      value: item,
      label: item,
      disabled: false,
    }));
  } else if (isMultiSelectOneOfSchema(schema)) {
    multiselectOptions = schema.oneOf.map((item) => ({
      value: item.const ?? '',
      label: item.title ?? '',
      disabled: false,
    }));
  } else {
    console.warn('Unsupported schema type for CustomAttributeMultiSelect');
  }

  return (
    <MultiSelect
      testId={label}
      description={description}
      label={label}
      onChange={(e) => onChange(e.detail.selectedOptions.map((c) => c.value!))}
      options={multiselectOptions}
      disabled={disabled}
      placeholder={'Select'}
      errorMessage={error}
      tokenSection={<></>}
      selectedOptions={multiselectOptions.filter((o) =>
        value?.includes(o.value!)
      )}
      renderTokens={false}
    />
  );
};
