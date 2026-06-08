import { useMutation } from '@apollo/client';
import { useFileUpdate } from '@risksmart-app/components/src/file/useFileUpdate';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import {
  InsertAssessmentActivityWithLinkedItemsDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import AssessmentActivityForm from 'src/pages/assessments/forms/assessment-activity-form';
import type { AssessmentActivityFormDataFields } from 'src/pages/assessments/forms/assessment-activity-form/assessmentActivitySchema';

import { evictField } from '@/utils/graphqlUtils';

import type { AssessmentTypeEnum } from '../../../../types';
import { useAssessmentTypeConfig } from '../../../../useAssessmentTypeConfig';

interface Props {
  assessmentMode: AssessmentTypeEnum;
}

const AssessmentActivityCreateTab: FC<Props> = ({ assessmentMode }) => {
  const navigate = useNavigate();
  const assessmentId = useGetGuidParam('assessmentId');
  const { updateFiles } = useFileUpdate();
  const [mutate] = useMutation(
    InsertAssessmentActivityWithLinkedItemsDocument,
    {
      update: (cache) => {
        evictField(cache, 'assessment');
        evictField(cache, 'compliance_monitoring_assessment');
        evictField(cache, 'internal_audit_entity');
        evictField(cache, 'internal_audit_report');
        evictField(cache, 'assessment_activity');
      },
    }
  );
  const {
    routing: { activityRegisterUrl },
  } = useAssessmentTypeConfig(assessmentMode);

  const onSave = async (variables: AssessmentActivityFormDataFields) => {
    const { files } = variables;
    const { data } = await mutate({
      variables: {
        ...variables,
        ParentId: assessmentId,
        LinkedItemIds: variables.LinkedItemIds.map((c) => c.Id),
        CustomAttributeData: variables.CustomAttributeData || undefined,
        AssignedUser: variables.AssignedUser?.value,
        OwnerUserIds: [],
        OwnerGroupIds: [],
      },
    });
    if (!data?.insertAssessmentActivityWithLinkedItems?.Id) {
      throw new Error('Assessment Activity id is missing');
    }
    await updateFiles({
      parentId: data.insertAssessmentActivityWithLinkedItems.Id,
      parentType: Parent_Type_Enum.AssessmentActivity,
      selectedFiles: files,
      originalFiles: [],
    });
    if (data?.insertAssessmentActivityWithLinkedItems?.Id) {
      navigate(activityRegisterUrl(assessmentId));
    }
  };

  const onDismiss = (saved?: boolean) => {
    if (!saved) {
      navigate(activityRegisterUrl(assessmentId));
    }
  };

  return (
    <AssessmentActivityForm
      onSave={onSave}
      onDismiss={onDismiss}
      renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
    />
  );
};

export default AssessmentActivityCreateTab;
