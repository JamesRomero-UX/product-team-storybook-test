import { useQuery } from '@apollo/client';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import { GetAssessmentRcsaActivitiesByParentIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { ownerAndContributorIds } from 'src/components/form';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import { useUpdateAssessment } from 'src/hooks/mutations/assessment/useUpdateAssessment';
import { useGetAssessmentById } from 'src/hooks/queries';
import AssessmentForm from 'src/pages/assessments/forms/assessment-form';
import type { AssessmentFormDataFields } from 'src/pages/assessments/forms/assessment-form/assessmentSchema';
import { defaultValues } from 'src/pages/assessments/forms/assessment-form/assessmentSchema';
import { getContributors, getOwners } from 'src/rbac/contributorHelper';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';
import { assessmentDetailsUrl } from 'src/utils/urls';

import AssessmentFindingPreview from '../../../forms/assessment-findings-preview/AssessmentFindingPreview';
import AssessmentStatusPreview from '../../../forms/assessment-status-preview/AssessmentStatusPreview';

const Tab: FC = () => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'assessmentActivities',
  });
  const assessmentId = useGetGuidParam('assessmentId');
  const navigate = useNavigate();
  const {
    data,
    error,
    loading: loadingAssessment,
  } = useGetAssessmentById({
    queryArgs: { Id: assessmentId },
    shouldSkip: !assessmentId,
  });
  if (error) {
    throw error;
  }

  const assessment = data?.assessment[0];
  const { hasPermission: canEdit, loading: canEditLoading } =
    useHasPermissionQuery('update:assessment', assessment);
  const { updateAssessment: updateMutationFn } = useUpdateAssessment();

  const { data: activitiesRCSAData } = useQuery(
    GetAssessmentRcsaActivitiesByParentIdDocument,
    {
      variables: {
        AssessmentId: assessmentId,
      },
    }
  );

  const disabledUsers = activitiesRCSAData?.assessment_activity.map(
    (activity) => ({
      userId: activity.AssignedUser ?? '',
      reason: t('disabledUserPrompt'),
    })
  );

  const onSave = async (data: AssessmentFormDataFields) => {
    if (!assessment) {
      throw new Error('Missing assessment');
    }
    await updateMutationFn({
      Id: assessment.Id,
      OriginatingItemId: assessment.OriginatingItemId,
      CustomAttributeData: data.CustomAttributeData || undefined,
      ...ownerAndContributorIds(data),
      TagTypeIds: data.tags?.map((t) => t.TagTypeId) || [],
      DepartmentTypeIds: data.departments?.map((d) => d.DepartmentTypeId) || [],
      CompletedByUser: data.CompletedByUser?.value ?? null,
      Status: data.Status,
      StartDate: data.StartDate,
      Title: data.Title,
      Summary: data.Summary,
      ActualCompletionDate: data.ActualCompletionDate,
      NextTestDate: data.NextTestDate,
      TargetCompletionDate: data.TargetCompletionDate,
      Outcome: data.Outcome,
    });
    navigate(assessmentDetailsUrl(assessmentId), { replace: true });
  };

  const onDismiss = (saved?: boolean) => {
    if (!saved) {
      navigate(-1);
    }
  };

  return (
    <AssessmentForm
      readOnly={!canEdit || canEditLoading || loadingAssessment}
      values={{
        ...defaultValues,
        ...assessment,
        Summary: assessment?.Summary ?? '',
        Owners: getOwners(assessment),
        Contributors: getContributors(assessment),
        ActualCompletionDate: assessment?.ActualCompletionDate ?? null,
        NextTestDate: assessment?.NextTestDate ?? null,
        TargetCompletionDate: assessment?.TargetCompletionDate ?? null,
        StartDate: assessment?.StartDate ?? null,
        CompletedByUser: assessment?.CompletedByUser
          ? { value: assessment.CompletedByUser, type: 'user' }
          : null,
        ancestorContributors: assessment?.ancestorContributors ?? [],
        Status: assessment?.Status ?? 'notstarted',
      }}
      onSave={onSave}
      onDismiss={onDismiss}
      aside={
        <>
          <AssessmentStatusPreview
            status={assessment?.Status}
            targetCompletionDate={assessment?.TargetCompletionDate}
            actualCompletionDate={assessment?.ActualCompletionDate}
          />
          <AssessmentFindingPreview
            assessmentId={assessment?.Id}
            outcome={assessment?.Outcome}
          />
        </>
      }
      renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
      disabledUsers={disabledUsers}
    />
  );
};

export default Tab;
