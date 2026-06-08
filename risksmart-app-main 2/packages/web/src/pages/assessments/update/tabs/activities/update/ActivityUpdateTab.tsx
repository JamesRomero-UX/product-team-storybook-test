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
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';
import { notEmpty } from 'src/utilityTypes';

import { getFriendlyId } from '@/utils/friendlyId';
import { evictField } from '@/utils/graphqlUtils';

import AssessmentActivityForm from '../../../../forms/assessment-activity-form/AssessmentActivityForm';
import type {
  AssessmentActivityFormDataFields,
  LinkedItem,
} from '../../../../forms/assessment-activity-form/assessmentActivitySchema';
import AssessmentFindingCreatePreview from '../../../../forms/assessment-finding-create-preview';
import type { AssessmentTypeEnum } from '../../../../types';
import { useAssessmentTypeConfig } from '../../../../useAssessmentTypeConfig';

interface Props {
  assessmentMode: AssessmentTypeEnum;
}

const AssessmentActivityUpdateTab: FC<Props> = ({ assessmentMode }) => {
  const navigate = useNavigate();
  const {
    routing: { activityRegisterUrl },
  } = useAssessmentTypeConfig(assessmentMode);
  const assessmentId = useGetGuidParam('assessmentId');
  const activityId = useGetGuidParam('activityId');
  const { data, error, refetch, loading } = useQuery(
    GetAssessmentActivityByIdDocument,
    {
      variables: { AssessmentActivityId: activityId },
      fetchPolicy: 'no-cache',
    }
  );
  if (error) {
    throw error;
  }
  const assessment_activity = data?.assessment_activity[0];
  const linked_items = data?.linked_item;
  const {
    hasPermission: canUpdateAssessmentActivities,
    loading: canUpdateAssessmentActivitiesLoading,
  } = useHasPermissionQuery(`update:assessment_activity`, assessment_activity);
  const { updateFiles } = useFileUpdate();
  const [mutate] = useMutation(
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

  const isLoading = loading || canUpdateAssessmentActivitiesLoading;

  const onSave = async (variables: AssessmentActivityFormDataFields) => {
    const { files } = variables;
    if (!assessment_activity) {
      throw new Error('Missing assessment activity');
    }
    const { data } = await mutate({
      variables: {
        ...variables,
        Id: activityId,
        OriginalTimestamp: assessment_activity?.ModifiedAtTimestamp,
        ParentId: assessmentId,
        LinkedItemIds: variables.LinkedItemIds.map((c) => c.Id),
        CustomAttributeData: variables.CustomAttributeData || undefined,
        AssignedUser: variables.AssignedUser?.value,
        OwnerUserIds: [],
        OwnerGroupIds: [],
      },
    });
    if (!data?.updateAssessmentActivityWithLinkedItems?.Id) {
      throw new Error('Assessment Activity id is missing');
    }
    await updateFiles({
      parentId: data.updateAssessmentActivityWithLinkedItems.Id,
      parentType: Parent_Type_Enum.AssessmentActivity,
      selectedFiles: files,
      originalFiles: assessment_activity?.files.map((f) => f.file),
    });
    await refetch();

    navigate(activityRegisterUrl(assessmentId));
  };

  const onDismiss = (saved?: boolean) => {
    if (!saved) {
      navigate(activityRegisterUrl(assessmentId));
    }
  };

  return (
    <AssessmentActivityForm
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
        AssignedUser: assessment_activity?.AssignedUser
          ? { value: assessment_activity.AssignedUser, type: 'user' }
          : null,
        LinkedItemIds:
          linked_items?.map((li) => getLinkedItems(li)).filter(notEmpty) ?? [],
        CustomAttributeData: assessment_activity?.CustomAttributeData,
        files: assessment_activity?.files.map((f) => f.file) ?? [],
      }}
      aside={
        <>
          <AssessmentFindingCreatePreview
            ratingType={Parent_Type_Enum.RiskAssessmentResult}
            assessmentId={assessmentId}
            entityLabel={'risk_one'}
            onSubmit={onSave}
            mode={assessmentMode}
          />
          <AssessmentFindingCreatePreview
            ratingType={Parent_Type_Enum.DocumentAssessmentResult}
            assessmentId={assessmentId}
            entityLabel={'document_one'}
            onSubmit={onSave}
            mode={assessmentMode}
          />
          <AssessmentFindingCreatePreview
            ratingType={Parent_Type_Enum.TestResult}
            assessmentId={assessmentId}
            entityLabel={'control_one'}
            onSubmit={onSave}
            mode={assessmentMode}
          />
          <AssessmentFindingCreatePreview
            ratingType={Parent_Type_Enum.ObligationAssessmentResult}
            assessmentId={assessmentId}
            entityLabel={'obligation_one'}
            onSubmit={onSave}
            mode={assessmentMode}
          />
        </>
      }
      onSave={onSave}
      onDismiss={onDismiss}
      readOnly={isLoading || !canUpdateAssessmentActivities}
      renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
    />
  );
};

const getLinkedItems = (
  item: GetAssessmentActivityByIdQuery['linked_item'][number]
): LinkedItem | null => {
  if (item.target_acceptance) {
    return {
      Label: item.target_acceptance.Title,
      Id: item.Target,
      Type: Parent_Type_Enum.Acceptance,
    };
  }

  if (item.target_action) {
    return {
      Label: item.target_action.Title,
      Id: item.Target,
      Type: Parent_Type_Enum.Action,
    };
  }
  if (item.target_control) {
    return {
      Label: item.target_control.Title,
      Id: item.Target,
      Type: Parent_Type_Enum.Control,
    };
  }

  if (item.target_control_group) {
    return {
      Label: item.target_control_group.Title,
      Id: item.Target,
      Type: Parent_Type_Enum.ControlGroup,
    };
  }

  if (item.target_document) {
    return {
      Label: item.target_document.Title,
      Id: item.Target,
      Type: Parent_Type_Enum.Document,
    };
  }

  if (item.target_indicator) {
    return {
      Label: item.target_indicator.Title,
      Id: item.Target,
      Type: Parent_Type_Enum.Indicator,
    };
  }

  if (item.target_issue) {
    return {
      Label: item.target_issue.Title,
      Id: item.Target,
      Type: Parent_Type_Enum.Issue,
    };
  }

  if (item.target_obligation) {
    return {
      Label: item.target_obligation.Title,
      Id: item.Target,
      Type: Parent_Type_Enum.Obligation,
    };
  }

  if (item.target_risk) {
    return {
      Label: item.target_risk.Title,
      Id: item.Target,
      Type: Parent_Type_Enum.Risk,
    };
  }
  if (item.target_appetite) {
    return {
      Label: getFriendlyId(
        Parent_Type_Enum.Appetite,
        item.target_appetite.SequentialId
      ),
      Id: item.Target,
      Type: Parent_Type_Enum.Appetite,
    };
  }
  console.error('Unsupported linked item', item.Id);

  return null;
};

export default AssessmentActivityUpdateTab;
