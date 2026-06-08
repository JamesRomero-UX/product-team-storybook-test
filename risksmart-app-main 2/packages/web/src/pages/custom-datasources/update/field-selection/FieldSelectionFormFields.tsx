import type { DataSourceType } from '@risksmart-app/shared/reporting/schema';
import type { GetFormCustomisationQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import type { CustomAttributeSchemaLookup } from '../types';
import FieldSelection from './FieldSelection';
import { type SelectedFields } from './fieldSelectionSchema';

type Props = {
  disabled: boolean;
  dataSourceType: DataSourceType;
  hasParent: boolean;
  customAttributeSchemaLookup: CustomAttributeSchemaLookup;
  formFieldConfigurations:
    | GetFormCustomisationQuery['form_field_configuration']
    | null;
};

const FieldSelectionFormFields: FC<Props> = ({
  disabled,
  dataSourceType,
  hasParent,
  customAttributeSchemaLookup,
  formFieldConfigurations,
}) => {
  const { control } = useFormContext<SelectedFields>();
  const { remove, append, update, fields } = useFieldArray({
    control,
    name: 'fields',
  });

  return (
    <FieldSelection
      formFieldConfigurations={formFieldConfigurations}
      customAttributeSchemaLookup={customAttributeSchemaLookup}
      hasParent={hasParent}
      disabled={disabled}
      selectedFields={fields}
      dataSourceType={dataSourceType}
      onLabelChange={(field) => {
        const index = fields.findIndex((f) => f.fieldId === field.fieldId);
        update(index, field);
      }}
      onSelectionChange={(e) => {
        if (e.selected) {
          append(e.field);
        } else {
          const index = fields.findIndex((f) => f.fieldId === e.field.fieldId);
          remove(index);
        }
      }}
    />
  );
};

export default FieldSelectionFormFields;
