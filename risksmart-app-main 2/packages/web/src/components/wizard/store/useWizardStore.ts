import type { WizardStatus } from '@risksmart-app/domain/src/types/consts';
import { create } from 'zustand';

import type { Risk, Step } from '../types';

type WizardState = {
  currentStep: number;
  setCurrentStep: (currentStep: number) => void;
  steps: Step[];
  setSteps: (steps: Step[]) => void;
  basePath: string;
  setBasePath: (basePath: string) => void;
  risk: Risk;
  setRisk: (risk: Risk) => void;
  assessmentId: string;
  setAssessmentId: (assessmentId: string) => void;
  activityId: string;
  setActivityId: (assessmentId: string) => void;
  showGuide: boolean;
  toggleShowGuide: () => void;
  wizardStatus: null | WizardStatus;
  setWizardStatus: (wizardStatus: null | WizardStatus) => void;
  isNavigatingFromActivity: boolean;
  setIsNavigatingFromActivity: (isNavigatingFromActivity: boolean) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
};

export const useWizardStore = create<WizardState>((set) => ({
  currentStep: 0,
  setCurrentStep: (currentStep: number) => set({ currentStep }),
  steps: [],
  setSteps: (steps: Step[]) => set({ steps }),
  basePath: '',
  setBasePath: (basePath: string) => set({ basePath }),
  risk: { riskId: '', title: '' },
  setRisk: (risk: Risk) => set({ risk }),
  assessmentId: '',
  setAssessmentId: (assessmentId: string) => set({ assessmentId }),
  activityId: '',
  setActivityId: (activityId: string) => set({ activityId }),
  showGuide: true,
  toggleShowGuide: () => set((state) => ({ showGuide: !state.showGuide })),
  wizardStatus: null,
  setWizardStatus: (wizardStatus: null | WizardStatus) => set({ wizardStatus }),
  isNavigatingFromActivity: false,
  setIsNavigatingFromActivity: (isNavigatingFromActivity: boolean) =>
    set({ isNavigatingFromActivity }),
  loading: false,
  setLoading: (loading: boolean) => set({ loading }),
}));
