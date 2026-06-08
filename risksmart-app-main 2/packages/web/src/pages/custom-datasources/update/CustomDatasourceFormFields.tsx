import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import type { GetFormCustomisationQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { type FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledInput from 'src/components/form/controlled-input';
import { useFeatures } from 'src/rbac/useFeatures';

import ConnectedCustomDatasourcePropertyFilter from './ConnectedCustomDatasourcePropertyFilter';
import { TreeCustomDatasourceModel } from './customDatasourceModel';
import {
  type CustomDatasourceFormData,
  defaultValues,
} from './customDatasourceSchema';
import DatasourceTree from './DatasourceTree';
import type { CustomAttributeSchemaLookup } from './types';

export type Props = {
  customAttributeSchemaLookup: CustomAttributeSchemaLookup;
  formFieldConfigurations:
    | GetFormCustomisationQuery['form_field_configuration']
    | null;
  mode: 'create' | 'update';
};

export const CustomDatasourceFormFields: FC<Props> = ({
  customAttributeSchemaLookup,
  formFieldConfigurations,
  mode,
}) => {
  const { control, watch, setValue, getFieldState } =
    useFormContext<CustomDatasourceFormData>();
  const dataSource = watch('dataSource');
  const enabledFeatures = useFeatures();
  const allFields = TreeCustomDatasourceModel(
    dataSource,
    customAttributeSchemaLookup,
    formFieldConfigurations,
    enabledFeatures
  ).allFields.sort((a, b) => a.defaultLabel.localeCompare(b.defaultLabel));

  const { t } = useTranslation(['common'], {
    keyPrefix: 'customDatasources.fields',
  });

  return (
    <>
      <ControlledInput
        testId={'title'}
        placeholder={t('title_placeholder')}
        name={'title'}
        label={t('title')}
        control={control}
        disableBottomPadding={true}
      />
      <FormField errorText={getFieldState('dataSource').error?.message}>
        <DatasourceTree
          customAttributeSchemaLookup={customAttributeSchemaLookup}
          formFieldConfigurations={formFieldConfigurations}
          testId={'dataSource'}
          name={'dataSource'}
          rootName={'dataSource'}
          disabled={mode === 'update'}
          onChange={(type) => {
            if (type === 'add') {
              return;
            }
            setValue('filters', defaultValues.filters);
          }}
        />
      </FormField>

      {allFields.length > 0 && (
        <ConnectedCustomDatasourcePropertyFilter
          rootDataSource={dataSource}
          allFields={allFields}
        />
      )}
    </>
  );
};
