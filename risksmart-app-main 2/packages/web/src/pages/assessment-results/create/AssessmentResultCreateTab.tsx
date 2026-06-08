import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import AssessmentFindingForm from 'src/pages/assessments/forms/AssessmentFindingForm';
import type { ObjectWithContributors } from 'src/rbac/Permission';

import { assessmentResultsUrl } from '@/utils/urls';
interface Props {
  assessment?: ObjectWithContributors;
}

const AssessmentResultCreateTab: FC<Props> = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation(['common']);
  const assessmentId = useGetGuidParam('assessmentId');
  const onDismiss = (saved?: boolean) => {
    if (!saved) {
      navigate(assessmentResultsUrl(assessmentId));
    }
  };

  return (
    <AssessmentFindingForm
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

export default AssessmentResultCreateTab;
