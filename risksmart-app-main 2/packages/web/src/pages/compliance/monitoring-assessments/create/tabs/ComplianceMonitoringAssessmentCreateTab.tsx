import { useMutation } from '@apollo/client';
import {
  GetAllComplianceMonitoringAssessmentsDocument,
  GetComplianceMonitoringAssessmentByIdDocument,
  InsertComplianceMonitoringAssessmentDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { ownerAndContributorIds } from 'src/components/form';
import { PageWrapper } from 'src/components/form/form/PageWrapper';

import { evictField } from '@/utils/graphqlUtils';
import { complianceMonitoringAssessmentDetailsUrl } from '@/utils/urls';

import ComplianceMonitoringAssessmentForm from '../../forms/compliance-monitoring-assessment-form';
import type { ComplianceMonitoringAssessmentFormDataFields } from '../../forms/compliance-monitoring-assessment-form/complianceMonitoringAssessmentSchema';

const ComplianceMonitoringAssessmentCreateTab: FC = () => {
  const navigate = useNavigate();
  const [mutate] = useMutation(InsertComplianceMonitoringAssessmentDocument, {
    update: (cache) => {
      evictField(cache, 'compliance_monitoring_assessment');
      evictField(cache, 'compliance_monitoring_assessment_aggregate');
    },
    refetchQueries: [
      GetComplianceMonitoringAssessmentByIdDocument,
      GetAllComplianceMonitoringAssessmentsDocument,
    ],
  });

  const onSave = async (
    variables: ComplianceMonitoringAssessmentFormDataFields
  ) => {
    const { data } = await mutate({
      variables: {
        object: {
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
        },
      },
    });
    const result = data?.insertComplianceMonitoringAssessmentApi;
    if (result?.Id) {
      navigate(complianceMonitoringAssessmentDetailsUrl(result.Id), {
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
    <ComplianceMonitoringAssessmentForm
      onSave={onSave}
      onDismiss={onDismiss}
      renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
    />
  );
};

export default ComplianceMonitoringAssessmentCreateTab;
