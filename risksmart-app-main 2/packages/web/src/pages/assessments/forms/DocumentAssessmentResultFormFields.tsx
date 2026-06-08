import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledAssessmentSelector from 'src/components/form/controlled-assessment-selector';
import ControlledComplianceMonitoringAssessmentSelector from 'src/components/form/controlled-compliance-monitoring-assessment-selector';
import ControlledDatePicker from 'src/components/form/controlled-date-picker';
import ControlledDocumentMultiselect from 'src/components/form/controlled-document-multiselect';
import { ControlledFileUpload } from 'src/components/form/controlled-file-upload/ControlledFileUpload';
import ControlledInternalAuditReportSelector from 'src/components/form/controlled-internal-audit-report-selector';
import ControlledRating from 'src/components/form/controlled-rating';
import ControlledTextarea from 'src/components/form/controlled-textarea';
import CustomisableFieldWrapper from 'src/components/form/form/customisable-form/CustomisableFieldWrapper';
import { useFormConfig } from 'src/utils/table/hooks/form/useFormConfig';

import type { AssessmentTypeEnum } from '../types';
import type { DocumentAssessmentResultFormDataFields } from './documentAssessmentResultSchema';
import { getDocumentAssessmentResultParentType } from './getDocumentAssessmentResultParentType';
import { RiskAssessmentResultTestIds } from './RiskAssessmentResultTestIds';

type Props = {
  readOnly?: boolean;
  showSelector?: AssessmentTypeEnum;
  disableDocumentSelector: boolean;
  assessmentMode?: AssessmentTypeEnum;
};

const DocumentAssessmentResultForm: FC<Props> = ({
  readOnly,
  showSelector,
  disableDocumentSelector,
  assessmentMode,
}) => {
  const { control } = useFormContext<DocumentAssessmentResultFormDataFields>();
  const { t } = useTranslation('common', {
    keyPrefix: 'assessmentResults.fields',
  });
  const formId = getDocumentAssessmentResultParentType(assessmentMode);
  const formConfig = useFormConfig(formId);

  return (
    <CustomisableFieldWrapper readOnly={readOnly}>
      {showSelector === 'rating' && (
        <ControlledAssessmentSelector
          defaultRequired={false}
          readOnly={readOnly}
          disabled={readOnly || disableDocumentSelector}
          key={'AssessmentId'}
          name={formConfig.AssessmentId.fieldId}
          label={formConfig.AssessmentId.formLabel}
          description={t('Assessment_help')}
          control={control}
          testId={'assessment'}
        />
      )}
      {showSelector === 'compliance_monitoring_assessment' && (
        <ControlledComplianceMonitoringAssessmentSelector
          defaultRequired={false}
          readOnly={readOnly}
          disabled={readOnly || disableDocumentSelector}
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
          disabled={readOnly || disableDocumentSelector}
          key={'InternalAuditReportId'}
          name={formConfig.InternalAuditReportId.fieldId}
          label={formConfig.InternalAuditReportId.formLabel}
          description={t('InternalAuditReport_help')}
          control={control}
          testId={RiskAssessmentResultTestIds.InternalAuditReport}
        />
      )}
      <ControlledDocumentMultiselect
        defaultRequired={true}
        key={'DocumentIds'}
        control={control}
        forceRequired={true}
        label={formConfig.DocumentIds.formLabel}
        description={t('Document_help')}
        disabled={readOnly || disableDocumentSelector}
        name={formConfig.DocumentIds.fieldId}
        placeholder={t('Document_placeholder')}
        testId={'documents'}
      />
      <ControlledRating
        defaultRequired={true}
        key={'dar_rating'}
        testId={'rating'}
        name={formConfig.Rating.fieldId}
        label={formConfig.Rating.formLabel}
        type={formConfig.Rating.displayType.ratingKey}
        description={t('Rating_help')}
        placeholder={t('Rating_placeholder')}
        ratingContext={
          assessmentMode === 'internal_audit_report'
            ? 'internal_audit'
            : undefined
        }
        control={control}
        disabled={readOnly}
      />
      <ControlledTextarea
        defaultRequired={false}
        key={'dar_rationale'}
        name={formConfig.Rationale.fieldId}
        testId={'rationale'}
        label={formConfig.Rationale.formLabel}
        description={t('Rationale_help')}
        placeholder={t('Rationale_placeholder')}
        control={control}
        disabled={readOnly}
      />
      <ControlledDatePicker
        defaultRequired={true}
        name={formConfig.TestDate.fieldId}
        testId={'testDate'}
        key={'dar_testDate'}
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

export default DocumentAssessmentResultForm;
