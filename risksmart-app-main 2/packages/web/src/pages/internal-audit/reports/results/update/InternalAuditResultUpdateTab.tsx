import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useGetInternalAuditResultsById } from 'src/hooks/queries';
import type {
  FormType,
  RatingResultType,
} from 'src/pages/assessments/forms/types';
import InternalAuditFindingForm from 'src/pages/internal-audit/reports/forms/InternalAuditFindingForm';
import type { ObjectWithContributors } from 'src/rbac/Permission';

interface Props {
  assessment: ObjectWithContributors;
  showAssessmentSelector: boolean;
  navigateToResults: boolean;
}

const InternalAuditResultUpdateTab: FC<Props> = ({
  assessment,
  showAssessmentSelector,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation(['common'], { keyPrefix: 'assessmentResults' });
  const findingId = useGetGuidParam('findingId');

  const { data, loading: loadingInternalAuditResult } =
    useGetInternalAuditResultsById({
      queryArgs: { internalAuditResultId: findingId },
    });

  const assessmentResult = data?.internal_audit_result_parent?.[0];

  const onDismiss = () => {
    navigate('..');
  };
  let readonly = false;
  let formType: FormType | undefined = undefined;
  let ratingFormType: RatingResultType | undefined = undefined;

  switch (assessmentResult?.ResultType) {
    case Parent_Type_Enum.RiskAssessmentResult:
    case Parent_Type_Enum.DocumentAssessmentResult:
    case Parent_Type_Enum.ObligationAssessmentResult:
    case Parent_Type_Enum.ImpactRating: {
      readonly = true;
      formType = 'rating';
      ratingFormType = assessmentResult?.ResultType;
      break;
    }
    case Parent_Type_Enum.TestResult: {
      formType = 'rating';
      ratingFormType = assessmentResult?.ResultType;
      break;
    }
    case Parent_Type_Enum.Action: {
      formType = 'action';
      break;
    }
    case Parent_Type_Enum.Issue: {
      formType = 'issue';
      break;
    }
  }

  return (
    <>
      {formType && assessment && (
        <InternalAuditFindingForm
          readonly={!assessment || readonly || loadingInternalAuditResult}
          parentAssessment={assessment}
          onDismiss={onDismiss}
          assessmentId={assessment.Id}
          assessmentResultId={findingId}
          formType={formType}
          ratingResultType={ratingFormType}
          showAssessmentSelector={showAssessmentSelector}
          navigateToResults={false}
          header={t('edit_modal_title')}
        />
      )}
    </>
  );
};

export default InternalAuditResultUpdateTab;
