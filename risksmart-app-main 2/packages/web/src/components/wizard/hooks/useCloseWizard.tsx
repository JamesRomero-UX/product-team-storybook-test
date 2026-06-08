import { useMutation } from '@apollo/client';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import { useTools } from '@risksmart-app/components/src/tools/useTools';
import {
  Assessment_Activity_Status_Enum,
  Assessment_Activity_Type_Enum,
  DeleteWizardDocument,
  UpdateAssessmentActivityWithLinkedItemsDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { handleError } from '@/utils/errorUtils';
import { evictField } from '@/utils/graphqlUtils';

import { useWizardStore } from '../store/useWizardStore';
import { StepStatus } from '../types';

export const useCloseWizard = (riskId: string) => {
  const {
    setCurrentStep,
    steps,
    setSteps,
    risk,
    assessmentId,
    activityId,
    setWizardStatus,
    setAssessmentId,
    setActivityId,
  } = useWizardStore();
  const [_, setToolsContent] = useTools();
  const { t } = useTranslation('common', { keyPrefix: 'wizard' });
  const { user } = useRisksmartUser();
  const { addNotification } = useNotifications();

  const [loading, setIsLoading] = useState(false);

  const [deleteWizardMutation] = useMutation(DeleteWizardDocument, {
    variables: {
      RiskId: riskId,
    },
  });

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

  return {
    closeWizard: async (isLastStep = false) => {
      const inProgressStep = steps?.findIndex(
        (step) => step.status === StepStatus.InProgress
      );
      if (isLastStep) {
        setIsLoading(true);
        await deleteWizardMutation({
          onError: (error) => {
            handleError(error);
            addNotification({
              type: 'error',
              content: <>{error.message}</>,
            });
          },
        });
        await updateAssessmentActivityWithLinkedItemsMutation({
          variables: {
            Id: activityId,
            Title: `${t('wizardName')} - ${risk.title}`,
            Status: Assessment_Activity_Status_Enum.Complete,
            ActivityType: Assessment_Activity_Type_Enum.Task,
            Summary: `${t('wizardName')} - ${risk.title}`,
            LinkedItemIds: [riskId],
            ParentId: assessmentId,
            CompletionDate: new Date().toISOString(),
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
        setSteps(t('steps'));
        setCurrentStep(0);
        setWizardStatus(null);
        setAssessmentId('');
        setActivityId('');
        setIsLoading(false);
      } else {
        setCurrentStep(inProgressStep);
      }

      setToolsContent(undefined);
    },
    loading,
  };
};
