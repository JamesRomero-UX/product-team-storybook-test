import { useTools } from '@risksmart-app/components/src/tools/useTools';
import { Risk_Assessment_Result_Control_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledAssessmentSelector from 'src/components/form/controlled-assessment-selector';
import ControlledComplianceMonitoringAssessmentSelector from 'src/components/form/controlled-compliance-monitoring-assessment-selector';
import ControlledDatePicker from 'src/components/form/controlled-date-picker';
import { ControlledFileUpload } from 'src/components/form/controlled-file-upload/ControlledFileUpload';
import ControlledInternalAuditReportSelector from 'src/components/form/controlled-internal-audit-report-selector';
import ControlledRating from 'src/components/form/controlled-rating';
import ControlledRiskMultiSelect from 'src/components/form/controlled-risk-multi-select';
import ControlledSelect from 'src/components/form/controlled-select';
import ControlledTextarea from 'src/components/form/controlled-textarea';
import CustomisableFieldWrapper from 'src/components/form/form/customisable-form/CustomisableFieldWrapper';
import Loading from 'src/components/loading';
import { useAggregation } from 'src/hooks/useAggregation';
import { useCalculateRiskRating } from 'src/ratings/useCalculateRiskRating';
import { useScoringSettings } from 'src/ratings/useScoringSettings';
import { useFormConfig } from 'src/utils/table/hooks/form/useFormConfig';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

import type { AssessmentTypeEnum } from '../types';
import { getParentTypeFromControlType } from './getParentTypeFromControlType';
import type { RiskAssessmentResultFormDataFields } from './riskAssessmentResultSchema';
import { RiskAssessmentResultTestIds } from './RiskAssessmentResultTestIds';
import { useControlTypeLabel } from './useControlTypeLabel';

type Props = {
  readOnly?: boolean;
  showSelector?: AssessmentTypeEnum;
  disableRiskSelector: boolean;
  assessmentMode?: AssessmentTypeEnum;
  onControlTypeChange: (
    controlType: Risk_Assessment_Result_Control_Type_Enum
  ) => void;
};

const RiskAssessmentResultForm: FC<Props> = ({
  readOnly,
  onControlTypeChange,
  showSelector,
  disableRiskSelector,
  assessmentMode,
}) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'assessmentResults.fields',
  });
  const [toolsContent, _] = useTools();

  const getControlTypeLabel = useControlTypeLabel();
  const { control, setValue, watch } =
    useFormContext<RiskAssessmentResultFormDataFields>();
  const { riskModel, loading } = useAggregation();
  const scoringSettingsDataEnabled = useIsFeatureFlagEnabled(
    'scoring_settings_data'
  );
  const { loading: scoringLoading } = useScoringSettings();

  const showRatingField = riskModel === 'default';
  const likelihood = watch('Likelihood');
  const impact = watch('Impact');

  const controlType = watch('ControlType');
  useEffect(() => {
    onControlTypeChange(controlType);
  }, [controlType, onControlTypeChange]);

  const getComputedRating = useCalculateRiskRating(controlType);

  const formId = getParentTypeFromControlType(controlType, assessmentMode);
  const formConfig = useFormConfig(formId);

  const updateRating = (
    likelihood: null | number | undefined,
    impact: null | number | undefined
  ) => {
    if (likelihood == null || impact == null) {
      return;
    }
    const computedRating = getComputedRating({
      likelihood,
      impact,
    });
    setValue('Rating', computedRating.value);
  };

  if (loading || (scoringSettingsDataEnabled && scoringLoading)) {
    return <Loading />;
  }

  return (
    <CustomisableFieldWrapper readOnly={readOnly}>
      {showSelector === 'rating' && (
        <ControlledAssessmentSelector
          defaultRequired={toolsContent === 'wizard'}
          addEmptyOption={true}
          readOnly={readOnly}
          disabled={readOnly}
          key={'AssessmentId'}
          name={formConfig.AssessmentId.fieldId}
          label={formConfig.AssessmentId.formLabel}
          description={t('Assessment_help')}
          control={control}
          testId={RiskAssessmentResultTestIds.Assessment}
        />
      )}
      {showSelector === 'compliance_monitoring_assessment' && (
        <ControlledComplianceMonitoringAssessmentSelector
          defaultRequired={false}
          readOnly={readOnly}
          disabled={readOnly || disableRiskSelector}
          key={'ComplianceMonitoringAssessmentId'}
          name={formConfig.ComplianceMonitoringAssessmentId.fieldId}
          label={formConfig.ComplianceMonitoringAssessmentId.formLabel}
          description={t('ComplianceMonitoringAssessment_help')}
          control={control}
          testId={RiskAssessmentResultTestIds.ComplianceMonitoringAssessment}
        />
      )}
      {showSelector === 'internal_audit_report' && (
        <ControlledInternalAuditReportSelector
          defaultRequired={false}
          readOnly={readOnly}
          disabled={readOnly || disableRiskSelector}
          key={'InternalAuditReportId'}
          name={formConfig.InternalAuditReportId.fieldId}
          label={formConfig.InternalAuditReportId.formLabel}
          description={t('InternalAuditReport_help')}
          control={control}
          testId={RiskAssessmentResultTestIds.InternalAuditReport}
        />
      )}
      <ControlledRiskMultiSelect
        defaultRequired={true}
        forceRequired={true}
        key={'RiskIds'}
        testId={RiskAssessmentResultTestIds.Risk}
        control={control}
        label={formConfig.RiskIds.formLabel}
        description={t('Risk_help')}
        disabled={readOnly || disableRiskSelector}
        name={formConfig.RiskIds.fieldId}
        placeholder={t('Risk_placeholder')}
      />
      <ControlledSelect
        defaultRequired={true}
        forceRequired={true}
        key={'controlType'}
        options={[
          {
            value: Risk_Assessment_Result_Control_Type_Enum.Uncontrolled,
            label: getControlTypeLabel(
              Risk_Assessment_Result_Control_Type_Enum.Uncontrolled
            ),
          },
          {
            value: Risk_Assessment_Result_Control_Type_Enum.Controlled,
            label: getControlTypeLabel(
              Risk_Assessment_Result_Control_Type_Enum.Controlled
            ),
          },
        ]}
        name={formConfig.ControlType.fieldId}
        label={formConfig.ControlType.formLabel}
        description={
          disableRiskSelector
            ? t('ControlType_help_readonly')
            : t('ControlType_help')
        }
        placeholder={t('ControlType_placeholder')}
        control={control}
        testId={RiskAssessmentResultTestIds.ControlType}
        disabled={readOnly || disableRiskSelector}
      />
      <ControlledRating
        defaultRequired={true}
        addEmptyOption={true}
        testId={RiskAssessmentResultTestIds.Likelihood}
        key={'likelihood'}
        name={formConfig.Likelihood.fieldId}
        label={formConfig.Likelihood.formLabel}
        type={formConfig.Likelihood.displayType.ratingKey}
        description={t('Likelihood_help')}
        placeholder={t('Likelihood_placeholder')}
        ratingContext={
          assessmentMode === 'internal_audit_report'
            ? 'internal_audit'
            : undefined
        }
        scoringCategory={'likelihood'}
        control={control}
        disabled={readOnly}
        onChange={(value) => {
          updateRating(value, impact);
        }}
      />
      <ControlledRating
        defaultRequired={true}
        addEmptyOption={true}
        testId={RiskAssessmentResultTestIds.Impact}
        key={'impact'}
        name={formConfig.Impact.fieldId}
        label={formConfig.Impact.formLabel}
        description={t('Impact_help')}
        placeholder={t('Impact_placeholder')}
        type={formConfig.Impact.displayType.ratingKey}
        ratingContext={
          assessmentMode === 'internal_audit_report'
            ? 'internal_audit'
            : undefined
        }
        scoringCategory={'impact'}
        control={control}
        disabled={readOnly}
        onChange={(value) => {
          updateRating(likelihood, value);
        }}
      />
      {showRatingField && (
        <ControlledRating
          defaultRequired={true}
          addEmptyOption={true}
          testId={RiskAssessmentResultTestIds.Rating}
          key={'rating'}
          name={formConfig.Rating.fieldId}
          label={formConfig.Rating.formLabel}
          description={t('Rating_help')}
          placeholder={t('Rating_placeholder')}
          type={
            controlType === Risk_Assessment_Result_Control_Type_Enum.Controlled
              ? 'risk_controlled'
              : 'risk_uncontrolled'
          }
          ratingContext={
            assessmentMode === 'internal_audit_report'
              ? 'internal_audit'
              : undefined
          }
          scoringCategory={'ratingLevel'}
          control={control}
          disabled={readOnly}
        />
      )}
      <ControlledTextarea
        defaultRequired={false}
        key={'rationale'}
        testId={'rationale'}
        name={formConfig.Rationale.fieldId}
        label={formConfig.Rationale.formLabel}
        description={t('Rationale_help')}
        placeholder={t('Rationale_placeholder')}
        control={control}
        disabled={readOnly}
      />
      <ControlledDatePicker
        defaultRequired={true}
        name={formConfig.TestDate.fieldId}
        key={'testDate'}
        label={formConfig.TestDate.formLabel}
        testId={RiskAssessmentResultTestIds.TestDate}
        description={t('TestDate_help')}
        control={control}
        disabled={readOnly}
      />
      <ControlledFileUpload
        key={'newFiles'}
        testId={'attachFiles'}
        label={formConfig.files.formLabel}
        description={t('newFiles_help')}
        control={control}
        name={formConfig.files.fieldId}
        disabled={readOnly}
      />
    </CustomisableFieldWrapper>
  );
};

export default RiskAssessmentResultForm;
