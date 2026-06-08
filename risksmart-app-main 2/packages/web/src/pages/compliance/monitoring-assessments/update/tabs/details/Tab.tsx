import { useMutation, useQuery } from '@apollo/client';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import {
  GetAssessmentRcsaActivitiesByParentIdDocument,
  GetComplianceMonitoringAssessmentByIdDocument,
  UpdateComplianceMonitoringAssessmentDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { ownerAndContributorIds } from 'src/components/form';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import AssessmentStatusPreview from 'src/pages/assessments/forms/assessment-status-preview/AssessmentStatusPreview';
import ComplianceMonitoringAssessmentForm from 'src/pages/compliance/monitoring-assessments/forms/compliance-monitoring-assessment-form/ComplianceMonitoringAssessmentForm';
import type { ComplianceMonitoringAssessmentFormDataFields } from 'src/pages/compliance/monitoring-assessments/forms/compliance-monitoring-assessment-form/complianceMonitoringAssessmentSchema';
import { defaultValues } from 'src/pages/compliance/monitoring-assessments/forms/compliance-monitoring-assessment-form/complianceMonitoringAssessmentSchema';
import SecondLineFindingPreview from 'src/pages/compliance/monitoring-assessments/forms/second-line-findings-preview/SecondLineFindingPreview';
import { getContributors, getOwners } from 'src/rbac/contributorHelper';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';
import { complianceMonitoringAssessmentDetailsUrl } from 'src/utils/urls';

import { evictField } from '@/utils/graphqlUtils';

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
  } = useQuery(GetComplianceMonitoringAssessmentByIdDocument, {
    variables: { Id: assessmentId },
  });
  if (error) {
    throw error;
  }

  const complianceMonitoringAssessment =
    data?.compliance_monitoring_assessment[0];

  const { hasPermission: canEdit, loading: canEditLoading } =
    useHasPermissionQuery(
      'update:compliance_monitoring_assessment',
      complianceMonitoringAssessment
    );
  const [updateMutation] = useMutation(
    UpdateComplianceMonitoringAssessmentDocument,
    {
      update: (cache) => {
        evictField(cache, 'risk_assessment_result');
        evictField(cache, 'document_assessment_result');
        evictField(cache, 'obligation_assessment_result');
        evictField(cache, 'compliance_monitoring_assessment');
      },
      refetchQueries: [GetComplianceMonitoringAssessmentByIdDocument],
    }
  );

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

  const onSave = async (data: ComplianceMonitoringAssessmentFormDataFields) => {
    if (!complianceMonitoringAssessment) {
      throw new Error('Missing compliance monitoring assessment');
    }
    await updateMutation({
      variables: {
        object: {
          Id: complianceMonitoringAssessment.Id,
          OriginatingItemId: complianceMonitoringAssessment.OriginatingItemId,
          CustomAttributeData: data.CustomAttributeData || undefined,
          ...ownerAndContributorIds(data),
          TagTypeIds: data.tags?.map((t) => t.TagTypeId) || [],
          DepartmentTypeIds:
            data.departments?.map((d) => d.DepartmentTypeId) || [],
          CompletedByUser: data.CompletedByUser?.value ?? null,
          Status: data.Status,
          StartDate: data.StartDate,
          Title: data.Title,
          Summary: data.Summary,
          ActualCompletionDate: data.ActualCompletionDate,
          NextTestDate: data.NextTestDate,
          TargetCompletionDate: data.TargetCompletionDate,
          Outcome: data.Outcome,
        },
      },
      onCompleted: () => {
        navigate(complianceMonitoringAssessmentDetailsUrl(assessmentId), {
          replace: true,
        });
      },
    });
  };

  const onDismiss = (saved?: boolean) => {
    if (!saved) {
      navigate(-1);
    }
  };

  return (
    <ComplianceMonitoringAssessmentForm
      readOnly={!canEdit || canEditLoading || loadingAssessment}
      values={{
        ...defaultValues,
        ...complianceMonitoringAssessment,
        Summary: complianceMonitoringAssessment?.Summary ?? '',
        Owners: getOwners(complianceMonitoringAssessment),
        Contributors: getContributors(complianceMonitoringAssessment),
        ActualCompletionDate:
          complianceMonitoringAssessment?.ActualCompletionDate ?? null,
        NextTestDate: complianceMonitoringAssessment?.NextTestDate ?? null,
        TargetCompletionDate:
          complianceMonitoringAssessment?.TargetCompletionDate ?? null,
        StartDate: complianceMonitoringAssessment?.StartDate ?? null,
        CompletedByUser: complianceMonitoringAssessment?.CompletedByUser
          ? {
              value: complianceMonitoringAssessment.CompletedByUser,
              type: 'user',
            }
          : null,
        ancestorContributors:
          complianceMonitoringAssessment?.ancestorContributors ?? [],
        Status: complianceMonitoringAssessment?.Status ?? 'notstarted',
      }}
      onSave={onSave}
      onDismiss={onDismiss}
      aside={
        <>
          <AssessmentStatusPreview
            status={complianceMonitoringAssessment?.Status ?? undefined}
            targetCompletionDate={
              complianceMonitoringAssessment?.TargetCompletionDate
            }
            actualCompletionDate={
              complianceMonitoringAssessment?.ActualCompletionDate
            }
          />
          <SecondLineFindingPreview
            complianceMonitoringAssessmentId={
              complianceMonitoringAssessment?.Id
            }
            outcome={complianceMonitoringAssessment?.Outcome}
          />
        </>
      }
      renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
      disabledUsers={disabledUsers}
    />
  );
};

export default Tab;
