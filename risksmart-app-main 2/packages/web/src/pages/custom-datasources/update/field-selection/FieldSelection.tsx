import type { DataSourceType } from '@risksmart-app/shared/reporting/schema';
import type { GetFormCustomisationQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useFeatures } from 'src/rbac/useFeatures';

import { DatasetModel } from '../datasetModel';
import type { CustomAttributeSchemaLookup } from '../types';
import Field from './Field';
import type { SelectedField } from './fieldSelectionSchema';

export type Props = {
  hasParent: boolean;
  dataSourceType: DataSourceType;
  selectedFields: SelectedField[];
  onSelectionChange: (e: { field: SelectedField; selected: boolean }) => void;
  onLabelChange: (field: SelectedField) => void;
  disabled: boolean;
  customAttributeSchemaLookup: CustomAttributeSchemaLookup;
  formFieldConfigurations:
    | GetFormCustomisationQuery['form_field_configuration']
    | null;
};

const FieldSelection: FC<Props> = ({
  hasParent,
  selectedFields,
  onSelectionChange,
  onLabelChange,
  disabled,
  dataSourceType,
  customAttributeSchemaLookup,
  formFieldConfigurations,
}) => {
  const enabledFeatures = useFeatures();
  const model = DatasetModel(
    dataSourceType,
    customAttributeSchemaLookup,
    formFieldConfigurations,
    hasParent,
    enabledFeatures
  );

  return (
    <ul className={'max-w-xl pl-0'}>
      {model.fields.map((f) => {
        const selectedField = selectedFields.find(
          (sf) => sf.fieldId == f.fieldId
        );

        return (
          <Field
            disabled={disabled}
            key={f.fieldId}
            defaultLabel={f.defaultLabel}
            field={selectedField}
            onLabelChange={(label) => onLabelChange({ ...f, label })}
            onSelectionChange={(checked) =>
              onSelectionChange({
                field: {
                  fieldId: f.fieldId,
                },
                selected: checked,
              })
            }
          />
        );
      })}
    </ul>
  );
};

export default FieldSelection;
