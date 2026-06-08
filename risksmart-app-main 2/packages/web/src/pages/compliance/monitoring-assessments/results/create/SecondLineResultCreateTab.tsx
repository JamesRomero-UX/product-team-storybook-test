import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import SecondLineFindingForm from 'src/pages/compliance/monitoring-assessments/forms/SecondLineFindingForm';
import type { ObjectWithContributors } from 'src/rbac/Permission';

import { complianceMonitoringAssessmentResultsUrl } from '@/utils/urls';

interface Props {
  assessment?: ObjectWithContributors;
}

const SecondLineResultCreateTab: FC<Props> = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation(['common']);
  const assessmentId = useGetGuidParam('assessmentId');
  const onDismiss = (saved?: boolean) => {
    if (!saved) {
      navigate(complianceMonitoringAssessmentResultsUrl(assessmentId));
    }
  };

  return (
    <SecondLineFindingForm
      readonly={!props.assessment}
      parentAssessment={props.assessment}
      onDismiss={onDismiss}
      assessmentId={assessmentId}
      formType={location.state?.type}
      ratingResultType={location.state?.ratingType}
      preselectedAssessedItemIds={location.state?.ids}
      navigateToResults={true}
      showAssessmentSelector={true}
      header={t('details')}
    />
  );
};

export default SecondLineResultCreateTab;
