import Modal from '@risksmart-app/components/src/modal';
import type { FC } from 'react';
import SecondLineResultForm from 'src/pages/compliance/monitoring-assessments/forms/SecondLineResultForm';
import InternalAuditResultForm from 'src/pages/internal-audit/reports/forms/InternalAuditResultForm';
import type { ObjectWithContributors } from 'src/rbac/Permission';

import AssessmentResultForm from '../forms/AssessmentResultForm';
import type { AssessmentTypeEnum } from '../types';
import type { ResultType } from './types';

interface Props {
  id?: string;
  resultType?: ResultType;
  onDismiss: (saved?: boolean) => void;
  assessmentMode: AssessmentTypeEnum;
  parentAssessment?: ObjectWithContributors;
  assessedItem?: ObjectWithContributors;
  hideTypeSelector?: boolean;
  i18n: {
    edit_modal_title?: string;
    create_modal_title?: string;
  };
}

const AssessmentResultModal: FC<Props> = ({
  id,
  resultType,
  onDismiss,
  parentAssessment,
  assessedItem,
  hideTypeSelector,
  i18n,
  assessmentMode,
}) => {
  return (
    <Modal
      data-testid={'assessmentResultModal'}
      disableContentPaddings={true}
      visible={true}
      onDismiss={(event) => {
        // don't close modal on overlay click
        if (event.detail.reason === 'overlay') {
          return;
        }
        onDismiss(false);
      }}
      header={id ? i18n.edit_modal_title : i18n.create_modal_title}
    >
      {assessmentMode === 'rating' ? (
        <AssessmentResultForm
          readonly={!!id}
          parentAssessment={parentAssessment}
          assessedItem={assessedItem}
          resultType={resultType}
          onDismiss={onDismiss}
          id={id}
          hideTypeSelector={hideTypeSelector}
          navigateToResults={false}
        />
      ) : null}
      {assessmentMode === 'internal_audit_report' ? (
        <InternalAuditResultForm
          readonly={!!id}
          parent={parentAssessment}
          assessedItem={assessedItem}
          resultType={resultType}
          onDismiss={onDismiss}
          id={id}
          hideTypeSelector={hideTypeSelector}
          navigateToResults={false}
        />
      ) : null}
      {assessmentMode === 'compliance_monitoring_assessment' ? (
        <SecondLineResultForm
          readonly={!!id}
          parent={parentAssessment}
          assessedItem={assessedItem}
          resultType={resultType}
          onDismiss={onDismiss}
          id={id}
          hideTypeSelector={hideTypeSelector}
          navigateToResults={false}
        />
      ) : null}
    </Modal>
  );
};

export default AssessmentResultModal;
