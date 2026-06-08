import { useMutation } from '@apollo/client';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import { WizardStatus } from '@risksmart-app/domain/src/types/consts';
import {
  Assessment_Activity_Status_Enum,
  Assessment_Activity_Type_Enum,
  Assessment_Status_Enum,
  InsertAssessmentActivityWithLinkedItemsDocument,
  InsertWizardDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { Dispatch, FC, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { ownerAndContributorIds } from 'src/components/form';
import { ModalForm } from 'src/components/form/form/ModalForm';
import AssessmentFormFields from 'src/pages/assessments/forms/assessment-form/AssessmentFormFields';
import {
  type AssessmentFormDataFields,
  AssessmentFormSchema,
  defaultValues,
} from 'src/pages/assessments/forms/assessment-form/assessmentSchema';

import { useInsertAssessment } from '@/hooks/mutations/assessment/useInsertAssessment';
import { handleError } from '@/utils/errorUtils';
import { evictField } from '@/utils/graphqlUtils';

import { useNavigateToStep } from '../hooks/useNavigateToStep';
import { useWizardStore } from '../store/useWizardStore';

type CreateAssessmentModalProps = {
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  basePath: string;
  riskId: string;
  riskTitle: string;
};

export const CreateAssessmentModal: FC<CreateAssessmentModalProps> = ({
  isVisible,
  setIsVisible,
  basePath,
  riskId,
  riskTitle,
}) => {
  const { addNotification } = useNotifications();
  const { user } = useRisksmartUser();
  const { navigateToStep } = useNavigateToStep();
  const { setWizardStatus, setAssessmentId, setActivityId, currentStep } =
    useWizardStore();
  const { t } = useTranslation(['common']);
  const { t: ts } = useTranslation(['common'], { keyPrefix: 'assessments' });
  const { t: tt } = useTranslation(['common'], { keyPrefix: 'wizard' });

  const { insertAssessment } = useInsertAssessment();

  const [insertAssessmentActivityWithLinkedItemsMutation] = useMutation(
    InsertAssessmentActivityWithLinkedItemsDocument,
    {
      update: (cache) => {
        evictField(cache, 'assessment');
        evictField(cache, 'assessment_activity');
      },
    }
  );

  const [insertWizardMutation] = useMutation(InsertWizardDocument, {
    variables: {
      object: { RiskId: riskId },
    },
  });

  const onSave = async (variables: AssessmentFormDataFields) => {
    let insertAssessmentResult;
    try {
      insertAssessmentResult = await insertAssessment({
        Title: variables.Title,
        Summary: variables.Summary,
        ActualCompletionDate: variables.ActualCompletionDate,
        NextTestDate: variables.NextTestDate,
        StartDate: variables.StartDate,
        TargetCompletionDate: variables.TargetCompletionDate,
        Status: variables.Status,
        Outcome: variables.Outcome,
        OriginatingItemId: riskId || null,
        CustomAttributeData: variables.CustomAttributeData || undefined,
        ...ownerAndContributorIds(variables),
        TagTypeIds: variables.tags?.map((t) => t.TagTypeId) || [],
        DepartmentTypeIds:
          variables.departments?.map((d) => d.DepartmentTypeId) || [],
        CompletedByUser: variables.CompletedByUser?.value || null,
      });
    } catch (error) {
      handleError(error);
      addNotification({
        type: 'error',
        content: (
          <>{error instanceof Error ? error.message : 'Unknown error'}</>
        ),
      });

      return;
    }
    const assessmentId = insertAssessmentResult?.insertAssessmentApi?.Id;
    if (!assessmentId) {
      throw new Error('Assessment id is missing');
    }

    const { data: assessmentActivityData } =
      await insertAssessmentActivityWithLinkedItemsMutation({
        variables: {
          Title: `${tt('wizardName')} - ${riskTitle}`,
          Status: Assessment_Activity_Status_Enum.Inprogress,
          ActivityType: Assessment_Activity_Type_Enum.Task,
          Summary: `${tt('wizardName')} - ${riskTitle}`,
          LinkedItemIds: [riskId],
          ParentId: assessmentId,
          OwnerUserIds: [user!.userId],
          OwnerGroupIds: [],
          IsRCSA: true,
          RiskId: riskId,
        },
        onError: (error) => {
          handleError(error);
          addNotification({
            type: 'error',
            content: <>{error.message}</>,
          });
        },
      });

    if (!assessmentActivityData?.insertAssessmentActivityWithLinkedItems?.Id) {
      throw new Error('Assessment Activity id is missing');
    }

    await insertWizardMutation({
      onCompleted: () => {
        setWizardStatus(WizardStatus.InProgress);
        navigateToStep(basePath, currentStep);
        setAssessmentId(assessmentId);
        setActivityId(
          assessmentActivityData?.insertAssessmentActivityWithLinkedItems?.Id ??
            ''
        );
      },
      onError: (error) => {
        handleError(error);
        addNotification({
          type: 'error',
          content: <>{error.message}</>,
        });
      },
      variables: {
        object: {
          RiskId: riskId,
          AssessmentId: assessmentId,
          Status: WizardStatus.InProgress,
          ActivityId:
            assessmentActivityData?.insertAssessmentActivityWithLinkedItems.Id,
        },
      },
    });
  };

  const onDismiss = async () => {
    setIsVisible(false);
  };

  const defaultData: AssessmentFormDataFields = {
    ...defaultValues,
    Owners: [
      {
        type: 'user',
        value: user!.userId,
      },
    ],
    Status: Assessment_Status_Enum.Inprogress,
  };

  return (
    <ModalForm
      schema={AssessmentFormSchema}
      defaultValues={defaultData}
      i18n={{
        entity_name: ts('entity_name'),
        edit_modal_title: t('details'),
        create_modal_title: t('details'),
      }}
      testId={'create-assessment-form-settings-button'}
      formId={'create-assessment-form'}
      parentType={Parent_Type_Enum.Assessment}
      onSave={onSave}
      onDismiss={onDismiss}
      visible={isVisible}
    >
      <AssessmentFormFields />
    </ModalForm>
  );
};
