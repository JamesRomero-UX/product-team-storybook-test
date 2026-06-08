import type { DataSourceType } from '@risksmart-app/shared/reporting/schema';
import type { GetFormCustomisationQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomisableForm } from 'src/components/form/form/CustomisableForm';
import { ModalWrapper } from 'src/components/form/form/ModalWrapper';

import type { CustomAttributeSchemaLookup } from '../types';
import FieldSelectionFormFields from './FieldSelectionFormFields';
import type { SelectedFields } from './fieldSelectionSchema';
import { defaultValues, selectedFieldsSchema } from './fieldSelectionSchema';

export type Props = {
  onDismiss: (saved: boolean) => Promise<void>;
  onSave: (data: SelectedFields) => Promise<void>;
  values?: SelectedFields;
  readOnly: boolean;
  dataSourceType: DataSourceType;
  hasParent: boolean;
  customAttributeSchemaLookup: CustomAttributeSchemaLookup;
  formFieldConfigurations:
    | GetFormCustomisationQuery['form_field_configuration']
    | null;
};

export const FieldSelectionForm: FC<Props> = ({
  onSave,
  onDismiss,
  values,
  readOnly,
  dataSourceType,
  hasParent,
  customAttributeSchemaLookup,
  formFieldConfigurations,
}) => {
  const { t: tt } = useTranslation(['common'], {
    keyPrefix: 'customDatasources',
  });

  return (
    <CustomisableForm
      defaultValues={defaultValues}
      i18n={tt('field_selection')}
      values={values}
      testId={'fieldSelectionModal'}
      onSave={onSave}
      readOnly={readOnly}
      schema={selectedFieldsSchema}
      renderTemplate={(renderProps) => (
        <ModalWrapper visible={true} {...renderProps} />
      )}
      formId={''}
      onDismiss={onDismiss}
    >
      <FieldSelectionFormFields
        formFieldConfigurations={formFieldConfigurations}
        customAttributeSchemaLookup={customAttributeSchemaLookup}
        hasParent={hasParent}
        disabled={readOnly}
        dataSourceType={dataSourceType}
      />
    </CustomisableForm>
  );
};
