import { useMutation, useQuery } from '@apollo/client';
import type { ApolloError } from '@apollo/client/errors';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import { useTools } from '@risksmart-app/components/src/tools/useTools';
import { WizardStatus } from '@risksmart-app/domain/src/types/consts';
import {
  Assessment_Activity_Status_Enum,
  Assessment_Activity_Type_Enum,
  GetWizardByIdDocument,
  UpdateAssessmentActivityWithLinkedItemsDocument,
  UpdateWizardDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetDetailParentPath } from 'src/routes/useGetDetailParentPath';

import { evictField } from '@/utils/graphqlUtils';

import { useWizardStore } from '../store/useWizardStore';
import type { Risk, Step } from '../types';
import { StepStatus } from '../types';
import { isDefaultTaxonomySteps } from '../utils';
import { useDefaultWizardStepConfiguration } from './useDefaultWizardStepConfiguration';
import { useNavigateToStep } from './useNavigateToStep';

export const useInitiateWizard = (
  risk: Risk,
  isOwnerOrContributor: boolean,
  wizardFeatureEnabled: boolean
) => {
  const {
    setCurrentStep,
    setSteps,
    setRisk,
    setAssessmentId,
    setActivityId,
    setWizardStatus,
    setIsNavigatingFromActivity,
    isNavigatingFromActivity,
    setLoading,
    steps,
  } = useWizardStore();
  const { navigateToStep } = useNavigateToStep();

  const parentUrl = useGetDetailParentPath(risk.riskId);

  const { t } = useTranslation('common', { keyPrefix: 'wizard' });

  const [toolsContent, setToolsContent] = useTools();
  const { user } = useRisksmartUser();
  const { addNotification } = useNotifications();
  const defaultSteps = useDefaultWizardStepConfiguration();

  const initiateSteps = (currentStep: number) => {
    const taxonomySteps = t('steps');
    const steps =
      Array.isArray(taxonomySteps) &&
      taxonomySteps.length > 0 &&
      !isDefaultTaxonomySteps(taxonomySteps)
        ? taxonomySteps
        : defaultSteps;

    return steps.map((step: Step, i) => {
      if (i < currentStep) {
        step.status = StepStatus.Complete;

        return step;
      }
      if (i === currentStep) {
        step.status = StepStatus.InProgress;

        return step;
      }

      step.status = StepStatus.ToDO;

      return step;
    });
  };

  const handleError = (error: ApolloError) => {
    addNotification({
      type: 'error',
      content: <>{error.message}</>,
    });
    setLoading(false);
    setToolsContent(undefined);
  };

  const [updateWizardMutation] = useMutation(UpdateWizardDocument);

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

  const { data, loading } = useQuery(GetWizardByIdDocument, {
    variables: {
      RiskId: risk.riskId,
    },
    fetchPolicy: 'no-cache',
    skip: !wizardFeatureEnabled || !isOwnerOrContributor,
  });

  useEffect(() => {
    if (!wizardFeatureEnabled || !isOwnerOrContributor) {
      return;
    }

    if (!loading && toolsContent !== 'wizard' && risk.title) {
      setRisk(risk);
      setCurrentStep(data?.wizard[0]?.CurrentStep ?? 0);
      setAssessmentId(data?.wizard[0]?.AssessmentId ?? '');
      setActivityId(data?.wizard[0]?.ActivityId ?? '');
      setSteps(initiateSteps(data?.wizard[0]?.CurrentStep ?? 0));
      setWizardStatus(data?.wizard[0]?.Status ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, risk.title]);

  useEffect(() => {
    if (!wizardFeatureEnabled || !isOwnerOrContributor) {
      return;
    }

    if (!loading && isNavigatingFromActivity && steps.length > 0) {
      (async () => {
        if (
          !data?.wizard[0]?.Status ||
          !data?.wizard[0]?.ActivityId ||
          !data?.wizard[0]?.AssessmentId
        ) {
          return;
        }

        setLoading(true);
        setToolsContent('wizard');

        if (data?.wizard[0]?.Status === WizardStatus.Planned) {
          await updateWizardMutation({
            variables: {
              object: {
                RiskId: risk.riskId,
                CurrentStep: 0,
                Status: WizardStatus.InProgress,
              },
            },
            onError: handleError,
          });
          await updateAssessmentActivityWithLinkedItemsMutation({
            variables: {
              Id: data?.wizard[0]?.ActivityId,
              Status: Assessment_Activity_Status_Enum.Inprogress,
              ActivityType: Assessment_Activity_Type_Enum.Task,
              LinkedItemIds: [risk.riskId],
              ParentId: data?.wizard[0]?.AssessmentId,
              IsWizardAction: true,
              OwnerUserIds: [user!.userId],
              OwnerGroupIds: [],
            },
            onError: handleError,
            onCompleted: () => {
              navigateToStep(`${parentUrl}/${risk.riskId}`, 0);
              setWizardStatus(WizardStatus.InProgress);
              setLoading(false);
            },
          });
        }

        if (data?.wizard[0]?.Status === WizardStatus.InProgress) {
          await updateAssessmentActivityWithLinkedItemsMutation({
            variables: {
              Id: data?.wizard[0]?.ActivityId,
              Status: Assessment_Activity_Status_Enum.Inprogress,
              ActivityType: Assessment_Activity_Type_Enum.Task,
              LinkedItemIds: [risk.riskId],
              ParentId: data?.wizard[0]?.AssessmentId,
              IsWizardAction: true,
              OwnerUserIds: [user!.userId],
              OwnerGroupIds: [],
            },
            onError: handleError,
            onCompleted: () => {
              navigateToStep(
                `${parentUrl}/${risk.riskId}`,
                data?.wizard[0]?.CurrentStep
              );
              setLoading(false);
            },
          });
        }
      })();

      setIsNavigatingFromActivity(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, steps]);

  return;
};
