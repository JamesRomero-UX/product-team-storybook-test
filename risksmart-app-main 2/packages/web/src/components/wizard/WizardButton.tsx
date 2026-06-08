import { useMutation } from '@apollo/client';
import type { ButtonProps } from '@risk-smart/themed-cloudscape-components/button';
import Button from '@risksmart-app/components/src/button';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import { useTools } from '@risksmart-app/components/src/tools/useTools';
import { WizardStatus } from '@risksmart-app/domain/src/types/consts';
import {
  Assessment_Activity_Status_Enum,
  Assessment_Activity_Type_Enum,
  UpdateAssessmentActivityWithLinkedItemsDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';

import { handleError } from '@/utils/errorUtils';
import { evictField } from '@/utils/graphqlUtils';

import { useNavigateToStep } from './hooks/useNavigateToStep';
import { useWizardStore } from './store/useWizardStore';

type WizardButtonProps = {
  riskId: string;
  basePath: string;
  onClick: ButtonProps['onClick'];
};

export const WizardButton: FC<WizardButtonProps> = ({
  riskId,
  onClick,
  basePath,
}) => {
  const { wizardStatus, assessmentId, activityId, currentStep } =
    useWizardStore();
  const { navigateToStep } = useNavigateToStep();
  const { t } = useTranslation('common', { keyPrefix: 'wizard' });
  const { addNotification } = useNotifications();
  const { user } = useRisksmartUser();

  const [toolsContent] = useTools();

  const isWizardInProgress = wizardStatus === WizardStatus.InProgress;

  const [updateAssessmentActivityWithLinkedItemsMutation, { loading }] =
    useMutation(UpdateAssessmentActivityWithLinkedItemsDocument, {
      update: (cache) => {
        evictField(cache, 'assessment_activity');
        evictField(cache, 'assessment');
        evictField(cache, 'compliance_monitoring_assessment');
        evictField(cache, 'internal_audit_report');
      },
    });

  const startWizard = async (event: CustomEvent<ButtonProps.ClickDetail>) => {
    if (toolsContent === 'wizard') {
      return;
    }
    if (isWizardInProgress) {
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
        onCompleted: () => {
          navigateToStep(basePath, currentStep);
        },
      });
    } else if (onClick) {
      onClick(event);
    }
  };

  return (
    <Button variant={'primary'} loading={loading} onClick={startWizard}>
      {`${isWizardInProgress ? 'Continue' : 'Start'} ${t('wizardName')}`}
    </Button>
  );
};
