import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { ownerAndContributorIds } from 'src/components/form';
import { PageWrapper } from 'src/components/form/form/PageWrapper';

import { useInsertAssessment } from '@/hooks/mutations/assessment/useInsertAssessment';
import { assessmentDetailsUrl } from '@/utils/urls';

import AssessmentForm from '../../forms/assessment-form';
import type { AssessmentFormDataFields } from '../../forms/assessment-form/assessmentSchema';

const AssessmentCreateTab: FC = () => {
  const navigate = useNavigate();
  const { insertAssessment } = useInsertAssessment();

  const onSave = async (variables: AssessmentFormDataFields) => {
    const data = await insertAssessment({
      CustomAttributeData: variables.CustomAttributeData || undefined,
      ...ownerAndContributorIds(variables),
      TagTypeIds: variables.tags?.map((t) => t.TagTypeId) || [],
      DepartmentTypeIds:
        variables.departments?.map((d) => d.DepartmentTypeId) || [],
      CompletedByUser: variables.CompletedByUser?.value ?? null,
      Status: variables.Status,
      StartDate: variables.StartDate,
      Title: variables.Title,
      Summary: variables.Summary,
      ActualCompletionDate: variables.ActualCompletionDate,
      NextTestDate: variables.NextTestDate,
      TargetCompletionDate: variables.TargetCompletionDate,
      Outcome: variables.Outcome,
      OriginatingItemId: null,
    });
    if (data?.insertAssessmentApi?.Id) {
      navigate(assessmentDetailsUrl(data.insertAssessmentApi.Id), {
        replace: true,
      });
    }
  };

  const onDismiss = (saved?: boolean) => {
    if (!saved) {
      navigate(-1);
    }
  };

  return (
    <AssessmentForm
      onSave={onSave}
      onDismiss={onDismiss}
      renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
    />
  );
};

export default AssessmentCreateTab;
