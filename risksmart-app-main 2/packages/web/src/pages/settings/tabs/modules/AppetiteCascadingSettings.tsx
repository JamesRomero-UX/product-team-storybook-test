import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import { Appetite_Model_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { type FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ControlledJsonEditor } from 'src/components/form/controlled-json-editor/ControlledJsonEditor';
import ControlledSelect from 'src/components/form/controlled-select';

export const AppetiteCascadingSettings: FC = () => {
  const { control } = useFormContext();
  const { t } = useTranslation('common', { keyPrefix: 'modules.fields' });

  return (
    <SpaceBetween size={'s'}>
      <FormField>
        <ControlledSelect
          testId={'appetiteCascadingModel'}
          control={control}
          name={'AppetiteCascadingModel'}
          label={t('AppetiteCascadingModel')}
          options={[
            {
              label: t('AppetiteCascadingModels.default'),
              value: Appetite_Model_Enum.Default,
            },
            {
              label: t('AppetiteCascadingModels.top_down_cascade'),
              value: Appetite_Model_Enum.TopDownCascade,
            },
          ]}
        />
      </FormField>
      <FormField>
        <ControlledJsonEditor
          control={control}
          name={'AppetiteCascadingModelConfig'}
          label={t('AppetiteCascadingModelConfig')}
        />
      </FormField>
    </SpaceBetween>
  );
};
