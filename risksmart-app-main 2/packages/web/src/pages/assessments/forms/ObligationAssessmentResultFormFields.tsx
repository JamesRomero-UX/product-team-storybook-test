import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledAssessmentSelector from 'src/components/form/controlled-assessment-selector';
import ControlledComplianceMonitoringAssessmentSelector from 'src/components/form/controlled-compliance-monitoring-assessment-selector';
import ControlledDatePicker from 'src/components/form/controlled-date-picker';
import { ControlledFileUpload } from 'src/components/form/controlled-file-upload/ControlledFileUpload';
import ControlledInternalAuditReportSelector from 'src/components/form/controlled-internal-audit-report-selector';
import ControlledObligationMultiselect from 'src/components/form/controlled-obligation-multiselect';
import ControlledRating from 'src/components/form/controlled-rating';
import ControlledTextarea from 'src/components/form/controlled-textarea';
import CustomisableFieldWrapper from 'src/components/form/form/customisable-form/CustomisableFieldWrapper';
import { useFormConfig } from 'src/utils/table/hooks/form/useFormConfig';

import type { AssessmentTypeEnum } from '../types';
import type { ObligationAssessmentResultFormIds } from './ObligationAssessmentResultForm';
import type { ObligationAssessmentResultFormDataFields } from './obligationAssessmentResultSchema';
import { RiskAssessmentResultTestIds } from './RiskAssessmentResultTestIds';

type Props = {
  readOnly?: boolean;
  showSelector?: AssessmentTypeEnum;
  disableObligationSelector: boolean;
  formId: ObligationAssessmentResultFormIds;
};

const ObligationAssessmentResultForm: FC<Props> = ({
  readOnly,
  showSelector,
  disableObligationSelector,
  formId,
}) => {
  const { control } =
    useFormContext<ObligationAssessmentResultFormDataFields>();
  const { t } = useTranslation('common', {
    keyPrefix: 'assessmentResults.fields',
  });
  const formConfig = useFormConfig(formId);

  return (
    <CustomisableFieldWrapper readOnly={readOnly}>
      {showSelector === 'rating' && (
        <ControlledAssessmentSelector
          defaultRequired={false}
          testId={'assessment'}
          readOnly={readOnly}
          disabled={readOnly || disableObligationSelector}
          key={'AssessmentId'}
          name={formConfig.AssessmentId.fieldId}
          label={formConfig.AssessmentId.formLabel}
          description={t('Assessment_help')}
          control={control}
        />
      )}
      {showSelector === 'compliance_monitoring_assessment' && (
        <ControlledComplianceMonitoringAssessmentSelector
          defaultRequired={false}
          readOnly={readOnly}
          disabled={readOnly || disableObligationSelector}
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
          disabled={readOnly || disableObligationSelector}
          key={'InternalAuditReportId'}
          name={formConfig.InternalAuditReportId.fieldId}
          label={formConfig.InternalAuditReportId.formLabel}
          description={t('InternalAuditReport_help')}
          control={control}
          testId={RiskAssessmentResultTestIds.InternalAuditReport}
        />
      )}
      <ControlledObligationMultiselect
        defaultRequired={true}
        key={'ObligationIds'}
        control={control}
        label={formConfig.ObligationIds.formLabel}
        description={t('Obligation_help')}
        disabled={readOnly || disableObligationSelector}
        name={formConfig.ObligationIds.fieldId}
        placeholder={t('Obligation_placeholder')}
      />
      <ControlledRating
        defaultRequired={true}
        key={'oar_rating'}
        testId={'rating'}
        name={formConfig.Rating.fieldId}
        label={formConfig.Rating.formLabel}
        type={formConfig.Rating.displayType.ratingKey}
        description={t('Rating_help')}
        placeholder={t('Rating_placeholder')}
        control={control}
        disabled={readOnly}
      />
      <ControlledTextarea
        defaultRequired={false}
        key={'oar_rationale'}
        name={formConfig.Rationale.fieldId}
        label={formConfig.Rationale.formLabel}
        testId={'rationale'}
        description={t('Rationale_help')}
        placeholder={t('Rationale_placeholder')}
        control={control}
        disabled={readOnly}
      />
      <ControlledDatePicker
        defaultRequired={true}
        name={formConfig.TestDate.fieldId}
        testId={'testDate'}
        key={'oar_testDate'}
        label={formConfig.TestDate.formLabel}
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

export default ObligationAssessmentResultForm;
