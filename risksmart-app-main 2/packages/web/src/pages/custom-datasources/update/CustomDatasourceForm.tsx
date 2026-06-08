import type { GetFormCustomisationQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomisableForm } from 'src/components/form/form/CustomisableForm';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import { type SubmitButton } from 'src/components/form/form/types';

import { CustomDatasourceFormFields } from './CustomDatasourceFormFields';
import type { CustomDatasourceFormData } from './customDatasourceSchema';
import {
  customDatasourceFormSchema,
  defaultValues,
} from './customDatasourceSchema';
import type { CustomAttributeSchemaLookup } from './types';

export type Props = {
  onDismiss: (saved: boolean) => Promise<void>;
  onSave: (data: CustomDatasourceFormData) => Promise<void>;
  onPreview: (data: CustomDatasourceFormData) => Promise<void>;
  values?: CustomDatasourceFormData;
  customAttributeSchemaLookup: CustomAttributeSchemaLookup;
  formFieldConfigurations:
    | GetFormCustomisationQuery['form_field_configuration']
    | null;
  readOnly: boolean;
  mode: 'create' | 'update';
};

export const CustomDatasourceForm: FC<Props> = ({
  onSave,
  onPreview,
  onDismiss,
  values,
  customAttributeSchemaLookup,
  formFieldConfigurations,
  readOnly,
  mode,
}) => {
  const { t } = useTranslation(['common'], { keyPrefix: 'customDatasources' });

  const defaultSubmitActions: SubmitButton<CustomDatasourceFormData>[] = [
    {
      label: t('save_button'),
      action: onSave,
    },
    {
      label: t('preview_button'),
      disableNotification: true,
      action: onPreview,
    },
  ];

  return (
    <CustomisableForm
      defaultValues={defaultValues}
      i18n={{
        entity_name: t('entity_name'),
      }}
      submitActions={defaultSubmitActions}
      values={values}
      onSave={onSave}
      readOnly={readOnly}
      schema={customDatasourceFormSchema}
      renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
      formId={''}
      onDismiss={onDismiss}
    >
      <CustomDatasourceFormFields
        mode={mode}
        customAttributeSchemaLookup={customAttributeSchemaLookup}
        formFieldConfigurations={formFieldConfigurations}
      />
    </CustomisableForm>
  );
};
