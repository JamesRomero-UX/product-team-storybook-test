import type { MatrixCell } from '@risksmart-app/atomic-ui';

export interface RiskScoringSettingsLang {
  alert: {
    title: string;
    subtitle: {
      impactLikelihood: string;
      multiImpact: string;
    };
    description: {
      default: string;
      pending: string;
      pendingNewVersion: string;
    };
  };
  page: {
    header: string;
    description: string;
  };
  impactLikelihoodCard: {
    title: string;
    description: string;
    selectedAlert: string;
    selectedBadge: string;
    setupBadge: string;
  };
  multiImpactCard: {
    title: string;
    description: string;
    selectedAlert: string;
    selectedBadge: string;
    setupBadge: string;
    unselectedAlert: string;
    unselectedBadge: string;
  };
  likelihoodLevels: {
    title: string;
    description: string;
    addButton: string;
  };
  impactLevels: {
    title: string;
    description: string;
    addButton: string;
  };
  matrix: {
    title: string;
    description: string;
    alert: {
      description: string;
    };
  };
  invertMatrixToggle: {
    title: string;
    checked: string;
    unchecked: string;
  };
  impactCategories: {
    title: string;
    description: string;
    addButton: string;
  };
  impactAggregation: {
    title: string;
    description: {
      average: string;
      maximum: string;
    };
    averageLabel: string;
    maximumLabel: string;
  };
}

export interface RiskScoringLevel {
  value: number;
  title: string;
  description: string;
  color: string;
}

export interface ImpactCategory {
  name: string;
  color: string;
}

export type ChangeStatus = 'none' | 'cosmetic' | 'structural';

export interface RiskScoringSettingsState {
  changeStatus: ChangeStatus;
  isMultiImpactEnabled: boolean;
  selectedMethodology: 'impact-likelihood' | 'multi-impact';
  likelihoodLevels: RiskScoringLevel[];
  impactLevels: RiskScoringLevel[];
  impactCategories: ImpactCategory[];
  matrix: MatrixCell[];
  isMatrixInverted: boolean;
  isLikelihoodLevelsComplete: boolean;
  isImpactLevelsComplete: boolean;
  isImpactCategoriesComplete: boolean;
  isMatrixComplete: boolean;
  isImpactLikelihoodComplete: boolean;
  isMultiImpactComplete: boolean;
  impactAggregation: 'average' | 'maximum';
}

export interface RiskScoringSettingsActions {
  onMultiImpactEnabledChange: (enabled: boolean) => void;
  onSelectedMethodologyChange: (
    methodology: 'impact-likelihood' | 'multi-impact'
  ) => void;
  onAddLikelihoodLevel: () => void;
  onAddImpactLevel: () => void;
  onAddImpactCategory: () => void;
  onDeleteLikelihoodLevel: (value: number) => void;
  onDeleteImpactLevel: (value: number) => void;
  onDeleteImpactCategory: (name: string) => void;
  onEditMatrixCell: (cell: MatrixCell) => void;
  onInvertMatrixChange: (inverted: boolean) => void;
  onEditLikelihoodLevel: (level: RiskScoringLevel) => void;
  onEditImpactLevel: (level: RiskScoringLevel) => void;
  onEditImpactCategory: (category: ImpactCategory) => void;
  onImpactAggregationChange: (aggregation: 'average' | 'maximum') => void;
}
