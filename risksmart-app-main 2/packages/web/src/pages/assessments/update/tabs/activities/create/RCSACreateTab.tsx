import { useMutation } from '@apollo/client';
import { useFileUpdate } from '@risksmart-app/components/src/file/useFileUpdate';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import { WizardStatus } from '@risksmart-app/domain/src/types/consts';
import {
  Assessment_Activity_Status_Enum,
  InsertAssessmentActivityWithLinkedItemsDocument,
  InsertWizardDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { ownerIds } from 'src/components/form';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import AssessmentRCSAActivityForm from 'src/pages/assessments/forms/assessment-rcsa-activity-form';
import type { AssessmentRCSAActivityFormDataFields } from 'src/pages/assessments/forms/assessment-rcsa-activity-form/assessmentRCSAActivitySchema';

import { evictField } from '@/utils/graphqlUtils';

import type { AssessmentTypeEnum } from '../../../../types';
import { useAssessmentTypeConfig } from '../../../../useAssessmentTypeConfig';

interface Props {
  assessmentMode: AssessmentTypeEnum;
}

const AssessmentRCSACreateTab: FC<Props> = ({ assessmentMode }) => {
  const navigate = useNavigate();
  const assessmentId = useGetGuidParam('assessmentId');
  const { updateFiles } = useFileUpdate();
  const [insertWizardMutation] = useMutation(InsertWizardDocument);
  const [insertAssessmentActivityWithLinkedItemsMutation] = useMutation(
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

  const onSave = async (variables: AssessmentRCSAActivityFormDataFields) => {
    const { files } = variables;

    await Promise.all(
      variables.RiskIds.map(async (riskId) => {
        const { data } = await insertAssessmentActivityWithLinkedItemsMutation({
          variables: {
            ...variables,
            ParentId: assessmentId,
            Status: Assessment_Activity_Status_Enum.Notstarted,
            LinkedItemIds: [riskId.value],
            CustomAttributeData: variables.CustomAttributeData || undefined,
            RiskId: riskId.value,
            IsRCSA: true,
            ...ownerIds(variables),
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

        await insertWizardMutation({
          variables: {
            object: {
              RiskId: riskId.value,
              AssessmentId: assessmentId,
              ActivityId: data.insertAssessmentActivityWithLinkedItems.Id,
              Status: WizardStatus.Planned,
            },
          },
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
      onSave={onSave}
      onDismiss={onDismiss}
      renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
    />
  );
};

export default AssessmentRCSACreateTab;
