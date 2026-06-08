import { useMutation } from '@apollo/client';
import type { SelectProps } from '@risk-smart/themed-cloudscape-components/select';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import { WizardStatus } from '@risksmart-app/domain/src/types/consts';
import {
  Assessment_Activity_Status_Enum,
  Assessment_Activity_Type_Enum,
  InsertAssessmentActivityWithLinkedItemsDocument,
  InsertWizardDocument,
  Parent_Type_Enum,
  UpdateAssessmentActivityWithLinkedItemsDocument,
  UpdateWizardDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { Dispatch, FC, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalForm } from 'src/components/form/form/ModalForm';
import { useGetAssessmentsRegister } from 'src/hooks/queries';

import { handleError } from '@/utils/errorUtils';
import { evictField } from '@/utils/graphqlUtils';

import { LinkAssessmentForm } from '../forms/LinkAssessmentForm';
import type { LinkAssessmentFormFields } from '../forms/LinkAssessmentFormSchema';
import { LinkAssessmentFormSchema } from '../forms/LinkAssessmentFormSchema';
import { useNavigateToStep } from '../hooks/useNavigateToStep';
import { useWizardStore } from '../store/useWizardStore';

type LinkAssessmentModalProps = {
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  setIsCreateAssessmentModalVisible: Dispatch<SetStateAction<boolean>>;
  basePath: string;
  riskId: string;
  riskTitle: string;
};

export const LinkAssessmentModal: FC<LinkAssessmentModalProps> = ({
  isVisible,
  setIsVisible,
  setIsCreateAssessmentModalVisible,
  basePath,
  riskId,
  riskTitle,
}) => {
  const { addNotification } = useNotifications();
  const { t } = useTranslation(['common'], { keyPrefix: 'wizard' });
  const { navigateToStep } = useNavigateToStep();
  const { user } = useRisksmartUser();
  const {
    setAssessmentId,
    setActivityId,
    wizardStatus,
    assessmentId,
    activityId,
    setWizardStatus,
    currentStep,
  } = useWizardStore();

  const [insertWizardMutation] = useMutation(InsertWizardDocument);
  const [updateWizardMutation] = useMutation(UpdateWizardDocument);

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

  const { data, error, loading } = useGetAssessmentsRegister({ queryArgs: {} });

  if (error && !loading) {
    setIsVisible(false);
  }

  const onSave = async (value: LinkAssessmentFormFields) => {
    if (wizardStatus === WizardStatus.Planned) {
      await updateWizardMutation({
        onCompleted: () => {
          navigateToStep(basePath, currentStep);
          setWizardStatus(WizardStatus.InProgress);
        },
        variables: {
          object: {
            RiskId: riskId,
            CurrentStep: 0,
            Status: WizardStatus.InProgress,
          },
        },
      });
      await updateAssessmentActivityWithLinkedItemsMutation({
        variables: {
          Id: activityId,
          Status: Assessment_Activity_Status_Enum.Inprogress,
          ActivityType: Assessment_Activity_Type_Enum.Task,
          LinkedItemIds: [riskId],
          ParentId: assessmentId,
          IsWizardAction: true,
          OwnerUserIds: [user!.userId],
          OwnerGroupIds: [],
        },
        onError: (error) => {
          handleError(error);
          addNotification({
            type: 'error',
            content: <>{error.message}</>,
          });
        },
      });

      return;
    }
    const { data } = await insertAssessmentActivityWithLinkedItemsMutation({
      variables: {
        Title: `${t('wizardName')} - ${riskTitle}`,
        Status: Assessment_Activity_Status_Enum.Inprogress,
        ActivityType: Assessment_Activity_Type_Enum.Task,
        Summary: `${t('wizardName')} - ${riskTitle}`,
        LinkedItemIds: [riskId],
        ParentId: value.AssessmentId,
        IsRCSA: true,
        RiskId: riskId,
        OwnerUserIds: [user!.userId],
        OwnerGroupIds: [],
      },
      onError: (error) => {
        handleError(error);
        addNotification({
          type: 'error',
          content: <>{error.message}</>,
        });
      },
    });

    if (!data?.insertAssessmentActivityWithLinkedItems?.Id) {
      throw new Error('Assessment Activity id is missing');
    }

    await insertWizardMutation({
      onCompleted: (result) => {
        if (!result.insertChildWizard?.RiskId) {
          addNotification({
            type: 'error',
            content: <>{'Wizard already exists for this risk'}</>,
          });

          return;
        }
        setWizardStatus(WizardStatus.InProgress);
        navigateToStep(basePath, currentStep);
        setAssessmentId(value.AssessmentId);
        setActivityId(data?.insertAssessmentActivityWithLinkedItems?.Id ?? '');
      },
      variables: {
        object: {
          RiskId: riskId,
          AssessmentId: value.AssessmentId,
          Status: WizardStatus.InProgress,
          ActivityId: data?.insertAssessmentActivityWithLinkedItems.Id,
        },
      },
      onError: (error) => {
        handleError(error);
        addNotification({
          type: 'error',
          content: <>{error.message}</>,
        });
      },
    });
  };

  const onDismiss = async () => {
    setIsVisible(false);
  };

  const createAssessment = async () => {
    setIsVisible(false);
    setIsCreateAssessmentModalVisible(true);
  };

  const assessmentOptions: (SelectProps.Option & { id: string })[] | undefined =
    data?.assessment.map((assessment) => {
      return {
        id: assessment.Id,
        value: assessment.Id,
        label: assessment.Title,
        description: assessment.Summary ?? undefined,
      };
    });

  return (
    <ModalForm
      values={{ AssessmentId: assessmentId }}
      i18n={{
        entity_name: 'Assessment', // TODO: translation
        edit_modal_title: t('forms.linkModalTitle'),
        create_modal_title: t('forms.linkModalTitle'),
      }}
      testId={'linkToAnAssessmentModal'}
      onSave={onSave}
      onDismiss={onDismiss}
      defaultValues={{ AssessmentId: '' }}
      schema={LinkAssessmentFormSchema}
      formId={'link-assessment-form'}
      visible={isVisible}
      secondaryActions={
        wizardStatus === WizardStatus.Planned
          ? []
          : [
              {
                label: t('forms.createAssessmentButton'),
                action: createAssessment,
              },
            ]
      }
      parentType={Parent_Type_Enum.Assessment}
    >
      <LinkAssessmentForm
        assessmentOptions={
          (wizardStatus === WizardStatus.Planned
            ? assessmentOptions?.filter(
                (assessmentOption) => assessmentOption.id === assessmentId
              )
            : assessmentOptions) ?? []
        }
      ></LinkAssessmentForm>
    </ModalForm>
  );
};
