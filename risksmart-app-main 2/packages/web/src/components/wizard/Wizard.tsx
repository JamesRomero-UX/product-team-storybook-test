import { useMutation } from '@apollo/client';
import HelpPanel from '@risk-smart/themed-cloudscape-components/help-panel';
import Button from '@risksmart-app/components/src/button';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import { UpdateWizardDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { ChevronDown, ChevronUp, MagicWand02 } from '@untitled-ui/icons-react';
import type { FC } from 'react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import Loading from 'src/components/loading';

import { handleError } from '@/utils/errorUtils';

import { useCloseWizard } from './hooks/useCloseWizard';
import { useWizardStore } from './store/useWizardStore';
import styles from './style.module.scss';
import { StepStatus } from './types';
import { scrollStepIntoView } from './utils';
import { WizardSteps } from './WizardSteps';

export const Wizard: FC = () => {
  const {
    currentStep,
    setCurrentStep,
    steps,
    setSteps,
    basePath,
    risk,
    showGuide,
    toggleShowGuide,
    loading: wizardLoading,
  } = useWizardStore();
  const navigate = useNavigate();
  const { t } = useTranslation('common', { keyPrefix: 'wizard' });
  const { addNotification } = useNotifications();

  const { closeWizard, loading: closeWizardLoading } = useCloseWizard(
    risk.riskId
  );

  const [updateWizardMutation, { loading }] = useMutation(
    UpdateWizardDocument,
    {
      variables: {
        object: { RiskId: risk.riskId, CurrentStep: currentStep + 1 },
      },
    }
  );

  const advanceStep = () => {
    updateWizardMutation({
      onCompleted: () => {
        steps[currentStep].status = StepStatus.Complete;
        steps[currentStep + 1].status = StepStatus.InProgress;
        setSteps(steps);
        setCurrentStep(currentStep + 1);
        navigate(`${basePath}/${steps[currentStep + 1].tab}`);
        scrollStepIntoView(currentStep);
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

  const isLastStep = () => {
    const inProgressStep = steps?.findIndex(
      (step) => step.status === StepStatus.InProgress
    );

    return inProgressStep === steps.length - 1;
  };

  useEffect(() => {
    scrollStepIntoView(currentStep);
  }, [currentStep]);

  return (
    <div className={styles.wizard}>
      <HelpPanel
        header={
          <div className={'flex items-center gap-3'}>
            <div
              className={
                'bg-navy_mid flex items-center justify-center w-[30px] min-w-[30px] h-[30px] min-h-[30px] rounded-full'
              }
            >
              <MagicWand02 height={20} color={'#00DECB'} />
            </div>
            <h2>{t('wizardTitle')}</h2>
          </div>
        }
      >
        {wizardLoading ? (
          <Loading />
        ) : (
          <>
            <div>
              <WizardSteps steps={steps} />
              <hr></hr>
              <div className={'flex'}>
                <h2>{'Guides'}</h2>
                {showGuide ? (
                  <ChevronUp
                    data-testid={'close-guide'}
                    className={'ml-auto cursor-pointer'}
                    onClick={toggleShowGuide}
                  />
                ) : (
                  <ChevronDown
                    data-testid={'open-guide'}
                    className={'ml-auto cursor-pointer'}
                    onClick={toggleShowGuide}
                  />
                )}
              </div>
              {showGuide && <p>{steps[currentStep]?.description}</p>}
              <hr></hr>
            </div>
            <div className={'flex justify-center gap-3 mt-auto'}>
              {isLastStep() ? (
                <Button
                  loading={closeWizardLoading}
                  onClick={() => {
                    closeWizard(true);
                  }}
                >
                  {'Finish'}
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      closeWizard(false);
                    }}
                  >
                    {'Save for later'}
                  </Button>
                  <Button
                    loading={loading}
                    iconName={'arrow-right'}
                    iconAlign={'right'}
                    onClick={advanceStep}
                  >
                    {'Next'}
                  </Button>
                </>
              )}
            </div>
          </>
        )}
      </HelpPanel>
    </div>
  );
};
