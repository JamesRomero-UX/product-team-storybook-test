import type { TFunction } from 'i18next';
import type { RiskScoringSettingsLang } from 'src/blocks';

export const buildLang = (
  t: TFunction<'common', 'riskScoringSettings'>
): RiskScoringSettingsLang => ({
  alert: {
    title: t('alert.title'),
    subtitle: {
      impactLikelihood: t('alert.subtitle.impactLikelihood'),
      multiImpact: t('alert.subtitle.multiImpact'),
    },
    description: {
      default: t('alert.description.default'),
      pending: t('alert.description.pending'),
      pendingNewVersion: t('alert.description.pendingNewVersion'),
    },
  },
  page: {
    header: t('page.header'),
    description: t('page.description'),
  },
  impactLikelihoodCard: {
    title: t('impactLikelihoodCard.title'),
    description: t('impactLikelihoodCard.description'),
    selectedAlert: t('impactLikelihoodCard.selectedAlert'),
    selectedBadge: t('impactLikelihoodCard.selectedBadge'),
    setupBadge: t('impactLikelihoodCard.setupBadge'),
  },
  multiImpactCard: {
    title: t('multiImpactCard.title'),
    description: t('multiImpactCard.description'),
    selectedAlert: t('multiImpactCard.selectedAlert'),
    selectedBadge: t('multiImpactCard.selectedBadge'),
    setupBadge: t('multiImpactCard.setupBadge'),
    unselectedAlert: t('multiImpactCard.unselectedAlert'),
    unselectedBadge: t('multiImpactCard.unselectedBadge'),
  },
  likelihoodLevels: {
    title: t('likelihoodLevels.title'),
    description: t('likelihoodLevels.description'),
    addButton: t('likelihoodLevels.addButton'),
  },
  impactLevels: {
    title: t('impactLevels.title'),
    description: t('impactLevels.description'),
    addButton: t('impactLevels.addButton'),
  },
  matrix: {
    title: t('matrix.title'),
    description: t('matrix.description'),
    alert: {
      description: t('matrix.alert.description'),
    },
  },
  invertMatrixToggle: {
    title: t('invertMatrixToggle.title'),
    checked: t('invertMatrixToggle.checked'),
    unchecked: t('invertMatrixToggle.unchecked'),
  },
  impactCategories: {
    title: t('impactCategories.title'),
    description: t('impactCategories.description'),
    addButton: t('impactCategories.addButton'),
  },
  impactAggregation: {
    title: t('impactAggregation.title'),
    description: {
      average: t('impactAggregation.description.average'),
      maximum: t('impactAggregation.description.maximum'),
    },
    averageLabel: t('impactAggregation.averageLabel'),
    maximumLabel: t('impactAggregation.maximumLabel'),
  },
});
