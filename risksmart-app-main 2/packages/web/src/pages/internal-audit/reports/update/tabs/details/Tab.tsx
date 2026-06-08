import { useMutation } from '@apollo/client';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import { UpdateInternalAuditReportDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { ownerAndContributorIds } from 'src/components/form';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import {
  useGetAssessmentRCSAActivitiesByAssessmentId,
  useGetInternalAuditReportById,
} from 'src/hooks/queries';
import AssessmentStatusPreview from 'src/pages/assessments/forms/assessment-status-preview/AssessmentStatusPreview';
import InternalAuditReportFindingPreview from 'src/pages/internal-audit/reports/forms/internal-audit-report-findings-preview/InternalAuditReportFindingPreview';
import InternalAuditReportForm from 'src/pages/internal-audit/reports/forms/internal-audit-report-form/InternalAuditReportForm';
import type { InternalAuditReportFormDataFields } from 'src/pages/internal-audit/reports/forms/internal-audit-report-form/internalAuditReportSchema';
import { defaultValues } from 'src/pages/internal-audit/reports/forms/internal-audit-report-form/internalAuditReportSchema';
import { getContributors, getOwners } from 'src/rbac/contributorHelper';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';
import { internalAuditReportDetailsUrl } from 'src/utils/urls';

import { evictField } from '@/utils/graphqlUtils';

const Tab: FC = () => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'assessmentActivities',
  });
  const internalAuditReportId = useGetGuidParam('assessmentId');
  const navigate = useNavigate();

  const {
    data,
    error,
    loading: loadingInternalReport,
    refetch,
  } = useGetInternalAuditReportById({
    queryArgs: { reportId: internalAuditReportId },
  });

  if (error) {
    throw error;
  }

  const internalAuditReport = data?.internal_audit_report[0];

  const { hasPermission: canEdit, loading: canEditLoading } =
    useHasPermissionQuery('update:internal_audit_report', internalAuditReport);
  const [updateMutation] = useMutation(UpdateInternalAuditReportDocument, {
    update: (cache) => {
      evictField(cache, 'risk_assessment_result');
      evictField(cache, 'document_assessment_result');
      evictField(cache, 'obligation_assessment_result');
      evictField(cache, 'internal_audit_entity');
      evictField(cache, 'internal_audit_report');
    },
  });

  const { data: activitiesRCSAData } =
    useGetAssessmentRCSAActivitiesByAssessmentId({
      queryArgs: { assessmentId: internalAuditReportId },
    });

  const disabledUsers = activitiesRCSAData?.assessment_activity.map(
    (activity) => ({
      userId: activity.AssignedUser ?? '',
      reason: t('disabledUserPrompt'),
    })
  );

  const onSave = async (data: InternalAuditReportFormDataFields) => {
    if (!internalAuditReport) {
      throw new Error('Missing internal audit report');
    }
    await updateMutation({
      variables: {
        object: {
          Id: internalAuditReport.Id,
          OriginatingItemId: internalAuditReport.OriginatingItemId,
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
        refetch();
        navigate(internalAuditReportDetailsUrl(internalAuditReportId), {
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
    <InternalAuditReportForm
      readOnly={!canEdit || canEditLoading || loadingInternalReport}
      values={{
        ...defaultValues,
        ...internalAuditReport,
        Summary: internalAuditReport?.Summary ?? '',
        Owners: getOwners(internalAuditReport),
        Contributors: getContributors(internalAuditReport),
        ActualCompletionDate: internalAuditReport?.ActualCompletionDate ?? null,
        NextTestDate: internalAuditReport?.NextTestDate ?? null,
        TargetCompletionDate: internalAuditReport?.TargetCompletionDate ?? null,
        StartDate: internalAuditReport?.StartDate ?? null,
        CompletedByUser: internalAuditReport?.CompletedByUser
          ? { value: internalAuditReport.CompletedByUser, type: 'user' }
          : null,
        ancestorContributors: internalAuditReport?.ancestorContributors ?? [],
        Status: internalAuditReport?.Status ?? 'notstarted',
      }}
      onSave={onSave}
      onDismiss={onDismiss}
      aside={
        <>
          <AssessmentStatusPreview
            status={internalAuditReport?.Status ?? undefined}
            targetCompletionDate={internalAuditReport?.TargetCompletionDate}
            actualCompletionDate={internalAuditReport?.ActualCompletionDate}
          />
          <InternalAuditReportFindingPreview
            internalAuditReportId={internalAuditReport?.Id}
            outcome={internalAuditReport?.Outcome}
          />
        </>
      }
      renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
      disabledUsers={disabledUsers}
    />
  );
};

export default Tab;
