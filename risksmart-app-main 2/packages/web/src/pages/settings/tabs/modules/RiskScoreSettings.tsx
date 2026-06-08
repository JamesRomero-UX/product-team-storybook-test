import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import { Risk_Scoring_Model_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { type FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ControlledJsonEditor } from 'src/components/form/controlled-json-editor/ControlledJsonEditor';
import ControlledSelect from 'src/components/form/controlled-select';

export const RiskScoreSettings: FC = () => {
  const { control } = useFormContext();
  const { t } = useTranslation('common', { keyPrefix: 'modules.fields' });

  return (
    <SpaceBetween size={'s'}>
      <FormField>
        <ControlledSelect
          control={control}
          testId={'riskScoringModel'}
          name={'RiskScoringModel'}
          label={t('RiskScoringModel')}
          options={[
            {
              label: t('RiskScoringModels.default'),
              value: Risk_Scoring_Model_Enum.Default,
            },
            {
              label: t('RiskScoringModels.control_effectiveness_averages'),
              value: Risk_Scoring_Model_Enum.ControlEffectivenessAverages,
            },
            {
              label: t(
                'RiskScoringModels.typed_control_effectiveness_averages'
              ),
              value: Risk_Scoring_Model_Enum.TypedControlEffectivenessAverages,
            },
          ]}
        />
      </FormField>
      <FormField>
        <ControlledJsonEditor
          control={control}
          name={'RiskScoringModelConfig'}
          label={t('RiskScoringModelConfig')}
        />
      </FormField>
    </SpaceBetween>
  );
};
