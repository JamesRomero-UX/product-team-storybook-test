import type { SelectProps } from '@risk-smart/themed-cloudscape-components';
import Grid from '@risk-smart/themed-cloudscape-components/grid';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import {
  Contributor_Type_Enum,
  Indicator_Type_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ControlledFileUpload } from 'src/components/form/controlled-file-upload/ControlledFileUpload';
import ControlledGroupAndUserContributorMultiSelect from 'src/components/form/controlled-group-and-user-contributor-multi-select';
import ControlledInput from 'src/components/form/controlled-input';
import ControlledSelect from 'src/components/form/controlled-select';
import ControlledTextarea from 'src/components/form/controlled-textarea';
import DepartmentSelector from 'src/components/form/department-selector';
import ConditionalField from 'src/components/form/form/customisable-form/ConditionalField';
import CustomisableFieldWrapper from 'src/components/form/form/customisable-form/CustomisableFieldWrapper';
import FieldGroup from 'src/components/form/form/customisable-form/FieldGroup';
import { FormField } from 'src/components/form/form/FormField';
import TagSelector from 'src/components/form/tag-selector';
import Tolerance from 'src/components/tolerance/Tolerance';
import TestScheduleFields from 'src/pages/controls/update/forms/TestScheduleFields';
import type { IndicatorFormDataFields } from 'src/pages/indicators/forms/indicatorSchema';
import { useFormConfig } from 'src/utils/table/hooks/form/useFormConfig';

import { TestIds } from './IndicatorDetailsFormFieldsTestIds';

interface Props {
  readOnly?: boolean;
  isUpdate?: boolean;
  latestTestDate?: string;
}

const IndicatorsDetailsFormFields: FC<Props> = ({
  readOnly,
  isUpdate = false,
  latestTestDate,
}) => {
  const { control, watch } = useFormContext<IndicatorFormDataFields>();
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'indicators.fields',
  });
  const { t } = useTranslation(['common'], {
    keyPrefix: 'fields',
  });

  const { options: indicatorTypeOptions } = useRating('indicator_type');
  const indicatorType: Indicator_Type_Enum =
    watch('Type') || Indicator_Type_Enum.Number;

  const showNumberTypeFields = indicatorType === Indicator_Type_Enum.Number;
  const showTextTypeFields = indicatorType === Indicator_Type_Enum.Text;
  const indicatorFormConfig = useFormConfig(Parent_Type_Enum.Indicator);

  return (
    <CustomisableFieldWrapper readOnly={readOnly}>
      <ControlledInput
        key={'title'}
        forceRequired={true}
        name={indicatorFormConfig.Title.fieldId}
        testId={'name'}
        label={indicatorFormConfig.Title.formLabel}
        control={control}
        description={st('title_help')}
        placeholder={st('title_placeholder')}
        disabled={readOnly}
      />

      <FieldGroup key={'typeAndDetails'}>
        <ControlledSelect
          key={'type'}
          testId={TestIds.Type}
          control={control}
          forceRequired={true}
          name={indicatorFormConfig.Type.fieldId}
          label={indicatorFormConfig.Type.formLabel}
          description={st('type_help')}
          // TODO
          placeholder={'Select'}
          options={indicatorTypeOptions as SelectProps.Option[]}
          disabled={readOnly || isUpdate}
        />

        <ConditionalField condition={showNumberTypeFields} key={'unit'}>
          <ControlledInput
            name={indicatorFormConfig.Unit.fieldId}
            testId={'unit'}
            label={indicatorFormConfig.Unit.formLabel}
            description={st('unit_help')}
            control={control}
            placeholder={st('unit_placeholder')}
            disabled={readOnly}
          />
        </ConditionalField>

        <FormField disableBottomPadding stretch>
          <Grid
            gridDefinition={[
              { colspan: 3 },
              { colspan: 3 },
              { colspan: 3 },
              { colspan: 3 },
            ]}
          >
            <ConditionalField
              condition={showNumberTypeFields}
              key={'lowerToleranceNum'}
            >
              <ControlledInput
                name={indicatorFormConfig.LowerToleranceNum.fieldId}
                label={indicatorFormConfig.LowerToleranceNum.formLabel}
                description={st('lower_tolerance_num_help')}
                control={control}
                placeholder={st('tolerance_placeholder')}
                disabled={readOnly}
                type={'number'}
                testId={TestIds.LowerTolerance}
              />
            </ConditionalField>

            <ConditionalField
              condition={showNumberTypeFields}
              key={'lowerAppetiteNum'}
            >
              <ControlledInput
                name={indicatorFormConfig.LowerAppetiteNum.fieldId}
                label={indicatorFormConfig.LowerAppetiteNum.formLabel}
                description={st('lower_appetite_num_help')}
                control={control}
                placeholder={st('tolerance_placeholder')}
                disabled={readOnly}
                type={'number'}
                testId={TestIds.LowerAppetite}
              />
            </ConditionalField>
            <ConditionalField
              condition={showNumberTypeFields}
              key={'upperAppetiteNum'}
            >
              <ControlledInput
                name={indicatorFormConfig.UpperAppetiteNum.fieldId}
                label={indicatorFormConfig.UpperAppetiteNum.formLabel}
                description={st('upper_appetite_num_help')}
                control={control}
                placeholder={st('tolerance_placeholder')}
                disabled={readOnly}
                type={'number'}
                testId={TestIds.UpperAppetite}
              />
            </ConditionalField>

            <ConditionalField
              condition={showNumberTypeFields}
              key={'upperToleranceNum'}
            >
              <ControlledInput
                name={indicatorFormConfig.UpperToleranceNum.fieldId}
                label={indicatorFormConfig.UpperToleranceNum.formLabel}
                description={st('upper_tolerance_num_help')}
                control={control}
                placeholder={st('tolerance_placeholder')}
                disabled={readOnly}
                type={'number'}
                testId={TestIds.UpperTolerance}
              />
            </ConditionalField>
          </Grid>
        </FormField>

        <ConditionalField condition={showNumberTypeFields} key={'tolerances'}>
          <div>
            <FormField stretch>
              <Tolerance
                upperTolerance={watch('UpperToleranceNum')}
                lowerTolerance={watch('LowerToleranceNum')}
                upperAppetite={watch('UpperAppetiteNum')}
                lowerAppetite={watch('LowerAppetiteNum')}
              />
            </FormField>
          </div>
        </ConditionalField>
        <ConditionalField condition={showTextTypeFields} key={'targetValueTxt'}>
          <ControlledInput
            key={'targetValueTxt'}
            forceRequired={true}
            testId={TestIds.TargetValueTxt}
            name={indicatorFormConfig.TargetValueTxt.fieldId}
            label={indicatorFormConfig.TargetValueTxt.formLabel}
            description={st('target_text_value_help')}
            control={control}
            placeholder={st('target_text_placeholder')}
            disabled={readOnly}
          />
        </ConditionalField>
      </FieldGroup>
      <ControlledTextarea
        key={'description'}
        name={indicatorFormConfig.Description.fieldId}
        testId={'description'}
        label={indicatorFormConfig.Description.formLabel}
        placeholder={st('description_placeholder')}
        description={st('description_help')}
        control={control}
        disabled={readOnly}
      />
      <ControlledGroupAndUserContributorMultiSelect
        key={'owners'}
        testId={TestIds.Owners}
        control={control}
        includeGroups={true}
        inheritedContributorsName={'ancestorContributors'}
        contributorType={Contributor_Type_Enum.Owner}
        label={indicatorFormConfig.Owners.formLabel}
        name={indicatorFormConfig.Owners.fieldId}
        placeholder={t('Owner_placeholder')}
        description={st('Owner_help')}
        disabled={readOnly}
        forceRequired={true}
      />
      <ControlledGroupAndUserContributorMultiSelect
        key={'contributors'}
        testId={'contributors'}
        control={control}
        includeGroups={true}
        inheritedContributorsName={'ancestorContributors'}
        contributorType={Contributor_Type_Enum.Contributor}
        label={indicatorFormConfig.Contributors.formLabel}
        name={indicatorFormConfig.Contributors.fieldId}
        placeholder={t('Contributor_placeholder')}
        description={st('Contributor_help')}
        disabled={readOnly}
      />
      <ControlledFileUpload
        key={'attachFiles'}
        label={indicatorFormConfig.files.formLabel}
        description={t('newFiles_help')}
        control={control}
        name={indicatorFormConfig.files.fieldId}
        testId={TestIds.Files}
        disabled={readOnly}
      />
      <TagSelector
        label={indicatorFormConfig.tags.formLabel}
        name={indicatorFormConfig.tags.fieldId}
        key={'tags'}
        testId={'tags'}
        control={control}
        disabled={readOnly}
      />
      <DepartmentSelector
        label={indicatorFormConfig.departments.formLabel}
        key={'departments'}
        testId={'departments'}
        name={indicatorFormConfig.departments.fieldId}
        control={control}
        disabled={readOnly}
      />
      <TestScheduleFields
        key={'testConfigFields'}
        control={control}
        readOnly={false}
        latestTestDate={latestTestDate ?? null}
        manualNextTestDueName={'schedule.ManualDueDate'}
        testFrequencyName={'schedule.Frequency'}
        testTimeToCompleteValueName={'schedule.TimeToCompleteValue'}
        testScheduleStartDateName={'schedule.StartDate'}
        testTimeToCompleteUnitName={'schedule.TimeToCompleteUnit'}
      />
    </CustomisableFieldWrapper>
  );
};

export default IndicatorsDetailsFormFields;
