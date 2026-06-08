import { useMutation, useQuery } from '@apollo/client';
import { useFileUpdate } from '@risksmart-app/components/src/file/useFileUpdate';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import type { GetAssessmentActivityByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  Assessment_Activity_Status_Enum,
  Assessment_Activity_Type_Enum,
  GetAssessmentActivityByIdDocument,
  Parent_Type_Enum,
  UpdateAssessmentActivityWithLinkedItemsDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { ownerIds } from 'src/components/form';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import AssessmentRCSAActivityForm from 'src/pages/assessments/forms/assessment-rcsa-activity-form';
import type { AssessmentRCSAActivityFormDataFields } from 'src/pages/assessments/forms/assessment-rcsa-activity-form/assessmentRCSAActivitySchema';
import type { AssessmentTypeEnum } from 'src/pages/assessments/types';
import { useAssessmentTypeConfig } from 'src/pages/assessments/useAssessmentTypeConfig';
import { getOwners } from 'src/rbac/contributorHelper';
import { notEmpty } from 'src/utilityTypes';

import { evictField } from '@/utils/graphqlUtils';

interface Props {
  assessmentMode: AssessmentTypeEnum;
}

export const RCSAUpdateTab: FC<Props> = ({ assessmentMode }) => {
  const navigate = useNavigate();
  const activityId = useGetGuidParam('activityId');
  const assessmentId = useGetGuidParam('assessmentId');
  const { data } = useQuery(GetAssessmentActivityByIdDocument, {
    variables: { AssessmentActivityId: activityId },
    fetchPolicy: 'no-cache',
  });
  const { updateFiles } = useFileUpdate();

  const [updateAssessmentActivityWithLinkedItemsMutation] = useMutation(
    UpdateAssessmentActivityWithLinkedItemsDocument,
    {
      update: (cache) => {
        evictField(cache, 'assessment_activity');
        evictField(cache, 'assessment');
        evictField(cache, 'compliance_monitoring_assessment');
        evictField(cache, 'internal_audit_report');
      },
    }
  );

  const {
    routing: { activityRegisterUrl },
  } = useAssessmentTypeConfig(assessmentMode);

  const assessment_activity = data?.assessment_activity[0];
  const linked_items = data?.linked_item;

  const readOnly = linked_items?.length === 0;

  const onSave = async (variables: AssessmentRCSAActivityFormDataFields) => {
    const { files } = variables;

    await Promise.all(
      variables.RiskIds.map(async (riskId) => {
        const { data } = await updateAssessmentActivityWithLinkedItemsMutation({
          variables: {
            ...variables,
            Id: activityId,
            OriginalTimestamp: assessment_activity?.ModifiedAtTimestamp,
            ParentId: assessmentId,
            LinkedItemIds: [riskId.value],
            CustomAttributeData: variables.CustomAttributeData || undefined,
            ...ownerIds(variables),
          },
        });
        if (!data?.updateAssessmentActivityWithLinkedItems?.Id) {
          throw new Error('Assessment Activity id is missing');
        }

        await updateFiles({
          parentId: data.updateAssessmentActivityWithLinkedItems.Id,
          parentType: Parent_Type_Enum.AssessmentActivity,
          selectedFiles: files,
          originalFiles: assessment_activity?.files.map((f) => f.file) ?? [],
        });
      })
    );

    navigate(activityRegisterUrl(assessmentId));
  };

  const onDismiss = (saved?: boolean) => {
    if (!saved) {
      navigate(activityRegisterUrl(assessmentId));
    }
  };

  return (
    <AssessmentRCSAActivityForm
      values={{
        Title: assessment_activity?.Title ?? '',
        ActivityType:
          assessment_activity?.ActivityType ??
          Assessment_Activity_Type_Enum.Task,
        Status:
          assessment_activity?.Status ??
          Assessment_Activity_Status_Enum.Notstarted,
        Summary: assessment_activity?.Summary ?? '',
        CompletionDate: assessment_activity?.CompletionDate,
        RiskIds:
          linked_items?.map((li) => getLinkedRisks(li)).filter(notEmpty) ?? [],
        CustomAttributeData: assessment_activity?.CustomAttributeData,
        files: assessment_activity?.files.map((f) => f.file) ?? [],
        Owners: getOwners(assessment_activity),
      }}
      onSave={onSave}
      onDismiss={onDismiss}
      renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
      disableRiskSelect={true}
      isUpdate={true}
      readOnly={readOnly}
    />
  );
};

const getLinkedRisks = (
  item: GetAssessmentActivityByIdQuery['linked_item'][number]
) => {
  if (item.target_risk) {
    return {
      value: item.target_risk.Id,
    };
  }

  console.error('Unsupported linked item', item.Id);

  return null;
};
