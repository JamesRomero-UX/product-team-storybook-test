import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import { type FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ControlledInput } from 'src/components/form/controlled-input/ControlledInput';
import { ControlledJsonEditor } from 'src/components/form/controlled-json-editor/ControlledJsonEditor';

export const IngestionConfigSettings: FC = () => {
  const { control } = useFormContext();
  const { t } = useTranslation('common', { keyPrefix: 'modules.fields' });

  return (
    <SpaceBetween size={'s'}>
      <ControlledInput
        type={'password'}
        control={control}
        name={'IngestionApiKey'}
        label={t('IngestionApiKey')}
      />
      <FormField>
        <ControlledJsonEditor
          control={control}
          name={'IngestionConfig'}
          label={t('IngestionConfig')}
        />
      </FormField>
    </SpaceBetween>
  );
};
