import { type FC } from 'react';
import { useNavigate } from 'react-router';

import { useWizardStore } from './store/useWizardStore';
import { type Step, StepStatus } from './types';

type WizardStepsProps = {
  steps: Step[];
};

export const WizardSteps: FC<WizardStepsProps> = ({ steps }) => {
  const { currentStep } = useWizardStore();

  return (
    <ul
      id={'steps-container'}
      className={
        'list-none !pl-1 max-h-[45vh] overflow-scroll overscroll-contain'
      }
    >
      {steps.map((step, i) => {
        const stepNumber = i;

        return (
          <li
            id={`step-${i}`}
            key={i + step.title}
            className={
              "relative pl-[20px] z-10 before:bg-[#e8e8ec] before:content-[''] before:absolute  before:w-[2px] before:top-[14px] before:bottom-[-10px] before:left-[8px] before:-z-10 last:pb-0 last:before:h-0"
            }
          >
            <div>
              {stepNumber === currentStep ? (
                <BulletCurrent />
              ) : step.status === StepStatus.Complete ||
                step.status === StepStatus.InProgress ? (
                <BulletComplete />
              ) : (
                <BulletToDo />
              )}
              <StepContent
                stepNumber={stepNumber}
                currentStep={currentStep}
                step={step}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
};

const BulletComplete: FC = () => {
  return (
    <div className={'ml-[-22px] w-[22px] fill-grey600 float-left'}>
      <svg aria-hidden={'true'} viewBox={'0 0 32 32'} focusable={'false'}>
        <circle
          stroke={'white'}
          strokeWidth={'5'}
          cx={'16'}
          cy={'16'}
          r={'13'}
        ></circle>
      </svg>
    </div>
  );
};

const BulletCurrent: FC = () => {
  return (
    <svg
      className={
        'w-[20px] ml-[-21px] fill-teal float-left bg-white ring-[3px] ring-white'
      }
      aria-hidden={'true'}
      viewBox={'0 0 32 32'}
      focusable={'false'}
    >
      <path
        d={
          'M16 4c6.6 0 12 5.4 12 12s-5.4 12-12 12S4 22.6 4 16 9.4 4 16 4zm0-4C7.2 0 0 7.2 0 16s7.2 16 16 16 16-7.2 16-16S24.8 0 16 0z'
        }
      ></path>
      <circle cx={'16'} cy={'16'} r={'8'}></circle>
    </svg>
  );
};

const BulletToDo: FC = () => {
  return (
    <svg
      className={
        'w-[17px] ml-[-19px] fill-grey300 float-left bg-white ring-[3px] ring-white'
      }
      aria-hidden={'true'}
      viewBox={'0 0 32 32'}
      focusable={'false'}
    >
      <path
        d={
          'M16 4c6.6 0 12 5.4 12 12s-5.4 12-12 12S4 22.6 4 16 9.4 4 16 4zm0-4C7.2 0 0 7.2 0 16s7.2 16 16 16 16-7.2 16-16S24.8 0 16 0z'
        }
      ></path>
    </svg>
  );
};

type StepContentProps = {
  stepNumber: number;
  currentStep: number;
  step: Step;
};

const StepContent: FC<StepContentProps> = ({
  stepNumber,
  currentStep,
  step,
}) => {
  const { setCurrentStep, basePath } = useWizardStore();

  const navigate = useNavigate();

  return (
    <div id={`${stepNumber}`} className={'flex flex-col pl-4 pb-6'}>
      <span className={'text-grey500 text-xs'}>
        {'Step '}
        {stepNumber + 1}
      </span>
      {stepNumber === currentStep ? (
        <span
          className={'text-teal cursor-pointer'}
          onClick={() => {
            navigate(`${basePath}/${step?.tab ?? ''}`);
            setCurrentStep(stepNumber);
          }}
        >
          {step.title}
        </span>
      ) : step.status === StepStatus.Complete ||
        step.status === StepStatus.InProgress ? (
        <span
          className={'text-grey600 cursor-pointer hover:text-teal'}
          onClick={() => {
            navigate(`${basePath}/${step?.tab ?? ''}`);
            setCurrentStep(stepNumber);
          }}
        >
          {step.title}
        </span>
      ) : (
        <span className={'text-grey300'}>{step.title}</span>
      )}
    </div>
  );
};
