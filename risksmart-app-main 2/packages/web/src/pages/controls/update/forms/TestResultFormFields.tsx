import type { SelectProps } from '@risk-smart/themed-cloudscape-components/select';
import type { FC } from 'react';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledControlMultiSelect from 'src/components/form/controlled-control-multi-select';
import ControlledDatePicker from 'src/components/form/controlled-date-picker';
import { ControlledFileUpload } from 'src/components/form/controlled-file-upload/ControlledFileUpload';
import ControlledGroupAndUserSelect from 'src/components/form/controlled-group-and-user-select';
import ControlledInput from 'src/components/form/controlled-input';
import ControlledRating from 'src/components/form/controlled-rating';
import ControlledSelect from 'src/components/form/controlled-select';
import ControlledTextarea from 'src/components/form/controlled-textarea';
import CustomisableFieldWrapper from 'src/components/form/form/customisable-form/CustomisableFieldWrapper';
import type { AssessmentTypeEnum } from 'src/pages/assessments/types';
import { useComputedEffectiveness } from 'src/ratings/useComputedEffectiveness';
import { useFormConfig } from 'src/utils/table/hooks/form/useFormConfig';

import { useCommonLookupLazy } from '@/hooks/useCommonLookupLazy';
import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';

import { getParentType } from './getParentType';
import { TestIds } from './TestResultFormFieldsTestIds';
import type { TestResultFormFieldsData } from './testResultSchema';

const isEmptyOrUndefined = (val: unknown) =>
  val === undefined || val === '' || val === null;

type Props = {
  readOnly?: boolean;
  disableControlSelect?: boolean;
  assessmentMode?: AssessmentTypeEnum;
};

const TestResultFormFields: FC<Props> = ({
  readOnly,
  disableControlSelect,
  assessmentMode,
}) => {
  const formId = getParentType(assessmentMode);
  const testResultForConfig = useFormConfig(formId);
  const {
    control,
    watch,
    setValue,
    formState: {
      dirtyFields: {
        PerformanceEffectiveness: isPerformanceDirty,
        DesignEffectiveness: isDesignDirty,
      },
    },
  } = useFormContext<TestResultFormFieldsData>();
  const internalAuditEnabled = useIsModuleEnabled('internal_audit_entity');
  const complianceMonitoringEnabled = useIsModuleEnabled(
    'obligation.subModules.compliance_monitoring_assessment'
  );
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'testResults.fields',
  });
  const { t } = useTranslation(['common']);

  const { getOptions } = useCommonLookupLazy();

  const testTypes: SelectProps.Option[] = getOptions('testTypes').sort(
    function (a, b) {
      if (a.label < b.label) {
        return -1;
      }
      if (a.label > b.label) {
        return 1;
      }

      return 0;
    }
  );

  const designEffectiveness = watch('DesignEffectiveness');
  const performanceEffectiveness = watch('PerformanceEffectiveness');

  const overallEffectiveness = useComputedEffectiveness({
    design: Number(designEffectiveness),
    performance: Number(performanceEffectiveness),
  });

  useEffect(() => {
    // Don't auto-calculate if either field is empty
    if (
      isEmptyOrUndefined(designEffectiveness) ||
      isEmptyOrUndefined(performanceEffectiveness)
    ) {
      return;
    }

    // Only auto-calculate if the user has actually modified at least one of the fields
    if (!isDesignDirty && !isPerformanceDirty) {
      return;
    }

    setValue('OverallEffectiveness', overallEffectiveness, {
      shouldValidate: true,
    });
  }, [
    designEffectiveness,
    isDesignDirty,
    isPerformanceDirty,
    overallEffectiveness,
    performanceEffectiveness,
    setValue,
  ]);

  return (
    <CustomisableFieldWrapper readOnly={readOnly}>
      <ControlledControlMultiSelect
        defaultRequired={true}
        key={'ControlIds'}
        testId={'controls'}
        control={control}
        label={testResultForConfig.ParentControlIds.formLabel}
        disabled={readOnly || disableControlSelect}
        name={testResultForConfig.ParentControlIds.fieldId}
        placeholder={t('control')}
        description={st('controlHelp')}
      />

      {!internalAuditEnabled && !complianceMonitoringEnabled && (
        <ControlledSelect
          key={'testType'}
          forceRequired={false}
          addEmptyOption={true}
          filteringType={'none'}
          label={testResultForConfig.TestType.formLabel}
          name={testResultForConfig.TestType.fieldId}
          description={st('testTypeHelp')}
          // TODO: translation
          placeholder={'Select'}
          control={control}
          options={testTypes}
          disabled={readOnly}
          testId={TestIds.TestType}
        />
      )}

      <ControlledInput
        allowDefaultValue={true}
        key={'title'}
        testId={'title'}
        defaultRequired={true}
        name={testResultForConfig.Title.fieldId}
        label={testResultForConfig.Title.formLabel}
        description={st('titleFieldHelp')}
        // TODO: translation
        placeholder={'Enter a title'}
        control={control}
        disabled={readOnly}
      />

      <ControlledRating
        allowDefaultValue={true}
        key={'designEffectiveness'}
        filteringType={'none'}
        description={st('designEffectivenessHelp')}
        label={testResultForConfig.DesignEffectiveness.formLabel}
        name={testResultForConfig.DesignEffectiveness.fieldId}
        type={testResultForConfig.DesignEffectiveness.displayType.ratingKey}
        // TODO: translation
        placeholder={'Select'}
        control={control}
        testId={'designEffectiveness'}
        ratingContext={
          assessmentMode === 'internal_audit_report'
            ? 'internal_audit'
            : undefined
        }
        addEmptyOption={true}
        disabled={readOnly}
      />

      <ControlledRating
        allowDefaultValue={true}
        key={'performanceEffectiveness'}
        filteringType={'none'}
        description={st('performanceEffectivenessHelp')}
        label={testResultForConfig.PerformanceEffectiveness.formLabel}
        name={testResultForConfig.PerformanceEffectiveness.fieldId}
        type={
          testResultForConfig.PerformanceEffectiveness.displayType.ratingKey
        }
        // TODO: translation
        placeholder={'Select'}
        control={control}
        testId={'performanceEffectiveness'}
        ratingContext={
          assessmentMode === 'internal_audit_report'
            ? 'internal_audit'
            : undefined
        }
        addEmptyOption={true}
        disabled={readOnly}
      />

      <ControlledRating
        allowDefaultValue={true}
        key={'overallEffectiveness'}
        filteringType={'none'}
        defaultRequired={true}
        description={st('controlTestResultHelp')}
        label={testResultForConfig.OverallEffectiveness.formLabel}
        name={testResultForConfig.OverallEffectiveness.fieldId}
        type={testResultForConfig.OverallEffectiveness.displayType.ratingKey}
        placeholder={'Select'}
        control={control}
        ratingContext={
          assessmentMode === 'internal_audit_report'
            ? 'internal_audit'
            : undefined
        }
        addEmptyOption={true}
        disabled={readOnly}
        testId={TestIds.OverallEffectiveness}
      />

      <ControlledTextarea
        key={'description'}
        name={testResultForConfig.Description.fieldId}
        testId={'description'}
        defaultRequired={true}
        label={testResultForConfig.Description.formLabel}
        description={st('controlTestDetailsHelp')}
        placeholder={t('enterDetailsAboutTest') ?? ''}
        control={control}
        disabled={readOnly}
      />

      <ControlledGroupAndUserSelect
        key={'submitter'}
        label={testResultForConfig.Submitter.formLabel}
        description={st('performedByHelp')}
        forceRequired={true}
        name={testResultForConfig.Submitter.fieldId}
        placeholder={t('searchForAPerson') ?? ''}
        control={control}
        includeGroups={false}
        disabled={readOnly}
        testId={TestIds.PerformedBy}
      />

      <ControlledDatePicker
        key={'testDate'}
        forceRequired={true}
        control={control}
        name={testResultForConfig.TestDate.fieldId}
        label={testResultForConfig.TestDate.formLabel}
        description={st('testDateHelp')}
        disabled={readOnly}
        testId={'testDate'}
      />

      <ControlledFileUpload
        key={'newFiles'}
        testId={'attachFiles'}
        label={testResultForConfig.files.formLabel}
        description={t('fields.newFiles_help')}
        control={control}
        name={testResultForConfig.files.fieldId}
        disabled={readOnly}
      />
    </CustomisableFieldWrapper>
  );
};

export default TestResultFormFields;
