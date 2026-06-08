import ColumnLayout from '@risk-smart/themed-cloudscape-components/column-layout';
import ExpandableSection from '@risk-smart/themed-cloudscape-components/expandable-section';
import i18n from '@risksmart-app/i18n/src/i18n';
import {
  Appetite_Type_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledDatePicker from 'src/components/form/controlled-date-picker';
import { ControlledFileUpload } from 'src/components/form/controlled-file-upload/ControlledFileUpload';
import ControlledImpactSelect from 'src/components/form/controlled-impact-select';
import ControlledRating from 'src/components/form/controlled-rating';
import ControlledSelect from 'src/components/form/controlled-select';
import ControlledTextarea from 'src/components/form/controlled-textarea';
import ConditionalField from 'src/components/form/form/customisable-form/ConditionalField';
import CustomisableFieldWrapper from 'src/components/form/form/customisable-form/CustomisableFieldWrapper';
import { useFormConfig } from 'src/utils/table/hooks/form/useFormConfig';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';

import { TestIds } from './AppetiteFormFieldsTestIds';
import type { AppetiteFormFieldsData } from './appetiteSchema';

type Props = {
  readOnly?: boolean;
};

const AppetiteGuidanceSection: FC<{ header: string; content: string }> = (
  props
) => {
  return (
    <ExpandableSection headerText={props.header} defaultExpanded={true}>
      <p>{props.content}</p>
    </ExpandableSection>
  );
};

const AppetiteFormFields: FC<Props> = ({ readOnly }) => {
  const { control, watch } = useFormContext<AppetiteFormFieldsData>();
  const { t } = useTranslation(['common']);
  const { t: at } = useTranslation('common', {
    keyPrefix: 'appetites.columns',
  });

  const { t: rt } = useTranslation('ratings');
  const appetites = rt('risk_appetite', { returnObjects: true });

  const posture = useIsFeatureFlagEnabled('posture');
  const impacts = useIsModuleEnabled('risk.subModules.impact');

  const appetiteType = watch('AppetiteType');
  const upperAppetite = watch('UpperAppetite');

  const guidanceForAppetite =
    appetites.find((a) => a.value === upperAppetite)?.guidance || [];
  const showGuidance = guidanceForAppetite.length > 0;
  const appetiteFormConfig = useFormConfig(Parent_Type_Enum.Appetite);

  return (
    <ColumnLayout columns={showGuidance ? 2 : 1} borders={'vertical'}>
      <CustomisableFieldWrapper readOnly={readOnly}>
        {impacts && (
          <ControlledSelect
            forceRequired={true}
            testId={TestIds.AppetiteType}
            key={'appetiteType'}
            name={appetiteFormConfig.AppetiteType.fieldId}
            label={appetiteFormConfig.AppetiteType.formLabel}
            description={at('appetiteType_help')}
            control={control}
            options={[
              {
                label: i18n.format(t('impact_one'), 'capitalize'),
                value: Appetite_Type_Enum.Impact,
              },
              {
                label: i18n.format(t('likelihood_one'), 'capitalize'),
                value: Appetite_Type_Enum.Likelihood,
              },
            ]}
          />
        )}

        <ControlledTextarea
          key={'statement'}
          testId={'appetiteStatement'}
          defaultRequired={false}
          name={appetiteFormConfig.Statement.fieldId}
          label={appetiteFormConfig.Statement.formLabel}
          description={at('riskAppetiteStatement_help')}
          placeholder={t('enterRiskAppetiteStatement') ?? ''}
          control={control}
          disabled={readOnly}
        />

        {appetiteType === Appetite_Type_Enum.Risk && !posture && (
          <ControlledRating
            key={'lowerAppetite'}
            filteringType={'none'}
            forceRequired={true}
            label={appetiteFormConfig.LowerAppetite.formLabel}
            name={appetiteFormConfig.LowerAppetite.fieldId}
            type={appetiteFormConfig.LowerAppetite.displayType.ratingKey}
            description={at('lowerAppetite_help')}
            placeholder={t('select') ?? ''}
            control={control}
            testId={TestIds.LowerAppetite}
            disabled={readOnly}
          />
        )}

        {appetiteType === Appetite_Type_Enum.Risk && (
          <ControlledRating
            key={'upperAppetite'}
            testId={TestIds.UpperAppetite}
            forceRequired={true}
            filteringType={'none'}
            label={appetiteFormConfig.UpperAppetite.formLabel}
            name={appetiteFormConfig.UpperAppetite.fieldId}
            type={appetiteFormConfig.UpperAppetite.displayType.ratingKey}
            description={
              posture ? at('posture_help') : at('upperAppetite_help')
            }
            placeholder={t('select') ?? ''}
            control={control}
            disabled={readOnly}
          />
        )}

        {appetiteType === Appetite_Type_Enum.Likelihood && (
          <ControlledRating
            key={'likelihoodAppetite'}
            testId={TestIds.LikelihoodAppetite}
            forceRequired={true}
            filteringType={'none'}
            label={appetiteFormConfig.LikelihoodAppetite.formLabel}
            name={appetiteFormConfig.LikelihoodAppetite.fieldId}
            type={appetiteFormConfig.LikelihoodAppetite.displayType.ratingKey}
            description={at('LikelihoodAppetiteHelp')}
            placeholder={t('select') ?? ''}
            control={control}
            disabled={readOnly}
          />
        )}

        {impacts && (
          <ConditionalField
            condition={appetiteType === Appetite_Type_Enum.Impact}
            key={'impact'}
          >
            <ControlledImpactSelect
              key={'impact'}
              testId={TestIds.Impact}
              forceRequired={true}
              name={appetiteFormConfig.ImpactId.fieldId}
              label={appetiteFormConfig.ImpactId.formLabel}
              description={at('impact_help')}
              control={control}
              disabled={readOnly}
            />
          </ConditionalField>
        )}

        {impacts && (
          <ConditionalField
            condition={appetiteType === Appetite_Type_Enum.Impact}
            key={'impactAppetite'}
          >
            <ControlledRating
              testId={'impactAppetite'}
              key={'impactAppetite'}
              forceRequired={true}
              filteringType={'none'}
              description={at('impactAppetite_help')}
              label={appetiteFormConfig.ImpactAppetite.formLabel}
              name={appetiteFormConfig.ImpactAppetite.fieldId}
              type={appetiteFormConfig.ImpactAppetite.displayType.ratingKey}
              placeholder={t('select') ?? ''}
              control={control}
              showValue={true}
              disabled={readOnly}
            />
          </ConditionalField>
        )}

        <ControlledDatePicker
          key={'effectiveDate'}
          testId={'effectiveDate'}
          defaultRequired={true}
          name={appetiteFormConfig.EffectiveDate.fieldId}
          label={appetiteFormConfig.EffectiveDate.formLabel}
          description={at('effectiveDate_help')}
          control={control}
          disabled={readOnly}
        />

        <ControlledFileUpload
          testId={'attachFiles'}
          key={'attachFiles'}
          label={appetiteFormConfig.files.formLabel}
          description={t('fields.newFiles_help')}
          control={control}
          name={appetiteFormConfig.files.fieldId}
          disabled={readOnly}
        />
      </CustomisableFieldWrapper>
      {showGuidance && (
        <div className={'px-6'}>
          {/* TODO: translations */}
          <h3>{'Appetite Guidance'}</h3>
          {Array.isArray(guidanceForAppetite) &&
            guidanceForAppetite.map(
              (g: { section: string; content: string }) => (
                <AppetiteGuidanceSection
                  key={g.section}
                  header={g.section}
                  content={g.content}
                />
              )
            )}
        </div>
      )}
    </ColumnLayout>
  );
};

export default AppetiteFormFields;
