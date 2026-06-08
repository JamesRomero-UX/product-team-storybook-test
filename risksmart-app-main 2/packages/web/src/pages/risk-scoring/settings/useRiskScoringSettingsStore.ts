/**
 * Public hook for risk scoring settings.
 *
 * Hydrates the store from the API query, derives computed state, and
 * assembles the typed value consumed by UI components.
 * Mutable state and actions live in store.internal.ts.
 */
import { useEffect, useRef } from 'react';
import type {
  ImpactCategory,
  MatrixCell,
  RiskScoringLevel,
  RiskScoringSettingsActions,
  RiskScoringSettingsState,
} from 'src/blocks';
import { useGetLatestRiskAssessmentResultConfig } from 'src/hooks/queries';

import { analyzeChanges } from './change-detection';
import { useInternalStore } from './store';
import {
  areImpactCategoriesComplete,
  areImpactLevelsComplete,
  areLikelihoodLevelsComplete,
  isMatrixComplete,
} from './validation';

export type { ScoringSettingsData } from './store';

export interface RiskScoringSettingsStoreValue {
  // Query state
  isLoading: boolean;
  id: string | null;
  originalTimestamp: string | null;
  refetch: () => Promise<unknown>;

  // Derived flags
  areSettingsComplete: boolean;
  requiresNewVersion: boolean;

  // Settings state & actions
  state: RiskScoringSettingsState;
  actions: RiskScoringSettingsActions;

  // Editing dialogs
  editingLevel: {
    type: 'likelihood' | 'impact';
    level: RiskScoringLevel;
  } | null;
  editingImpactCategory: ImpactCategory | null;
  editingMatrixCell: MatrixCell | null;
  setEditingLevel: (
    editing: { type: 'likelihood' | 'impact'; level: RiskScoringLevel } | null
  ) => void;
  setEditingImpactCategory: (category: ImpactCategory | null) => void;
  setEditingMatrixCell: (cell: MatrixCell | null) => void;
  confirmEditLevel: (level: RiskScoringLevel) => void;
  confirmEditImpactCategory: (updated: ImpactCategory) => void;
  confirmEditMatrixCell: (cell: MatrixCell) => void;

  // Lifecycle
  resetToInitial: () => void;
}

export const useRiskScoringSettingsStore =
  (): RiskScoringSettingsStoreValue => {
    const { config, loading, id, originalTimestamp, refetch } =
      useGetLatestRiskAssessmentResultConfig();
    const store = useInternalStore();
    const lastHydratedIdRef = useRef<string | null>(null);

    // -- Hydration: translate API response into store state --

    useEffect(() => {
      if (loading || !config) {
        return;
      }

      const dataKey = `${id}-${originalTimestamp}`;

      if (lastHydratedIdRef.current === dataKey) {
        return;
      }

      lastHydratedIdRef.current = dataKey;

      const mapLevel = (r: {
        value: number;
        title: string;
        description?: string | null;
        color: string;
      }) => ({
        value: r.value,
        title: r.title,
        description: r.description ?? '',
        color: r.color,
      });

      store.hydrate({
        likelihoodLevels:
          config?.likelihood?.ratings
            ?.map(mapLevel)
            .sort((a, b) => a.value - b.value) ?? [],
        impactLevels:
          config?.impact?.ratings
            ?.map(mapLevel)
            .sort((a, b) => a.value - b.value) ?? [],
        impactCategories:
          config?.impact?.categories?.map((c) => ({
            name: c.name,
            color: c.color,
          })) ?? [],
        matrix:
          config?.matrix?.map((e) => ({
            title: e.title,
            value: e.value,
            color: e.color,
            likelihood: e.likelihood,
            impact: e.impact,
          })) ?? [],
        impactAggregation: config?.impact?.aggregation ?? 'average',
        id: id!,
        originalTimestamp: originalTimestamp!,
      });
    }, [loading, config, store, id, originalTimestamp]);

    useEffect(() => {
      return () => {
        lastHydratedIdRef.current = null;
        useInternalStore.getState().reset();
      };
    }, []);

    // -- Derived state: computed from store, never stored directly --

    const likelihoodComplete = areLikelihoodLevelsComplete(
      store.current?.likelihoodLevels ?? []
    );
    const impactComplete = areImpactLevelsComplete(
      store.current?.impactLevels ?? []
    );
    const categoriesComplete = areImpactCategoriesComplete(
      store.current?.impactCategories ?? []
    );
    const matrixComplete = isMatrixComplete(
      store.current?.matrix ?? [],
      store.current?.likelihoodLevels.length ?? 0,
      store.current?.impactLevels.length ?? 0
    );

    const state: RiskScoringSettingsState = {
      changeStatus:
        store.current && store.initial
          ? analyzeChanges(store.initial, store.current)
          : 'none',
      isMultiImpactEnabled: store.isMultiImpactEnabled,
      selectedMethodology: store.selectedMethodology,
      likelihoodLevels: store.current?.likelihoodLevels ?? [],
      impactLevels: store.current?.impactLevels ?? [],
      impactCategories: store.current?.impactCategories ?? [],
      matrix: store.current?.matrix ?? [],
      isMatrixInverted: store.isMatrixInverted,
      impactAggregation: store.current?.impactAggregation ?? 'average',
      isLikelihoodLevelsComplete: likelihoodComplete,
      isImpactLevelsComplete: impactComplete,
      isImpactCategoriesComplete: categoriesComplete,
      isMatrixComplete: matrixComplete,
      isImpactLikelihoodComplete:
        likelihoodComplete && impactComplete && matrixComplete,
      isMultiImpactComplete: categoriesComplete,
    };

    const areSettingsComplete =
      state.isImpactLikelihoodComplete &&
      (state.selectedMethodology === 'multi-impact'
        ? state.isMultiImpactComplete
        : true);

    const requiresNewVersion = state.changeStatus === 'structural';

    // -- Actions: adapter mapping from internal store to public interface --

    const actions: RiskScoringSettingsActions = {
      onMultiImpactEnabledChange: store.setMultiImpactEnabled,
      onSelectedMethodologyChange: store.setSelectedMethodology,
      onAddLikelihoodLevel: store.addLikelihoodLevel,
      onAddImpactLevel: store.addImpactLevel,
      onAddImpactCategory: store.addImpactCategory,
      onDeleteLikelihoodLevel: store.deleteLikelihoodLevel,
      onDeleteImpactLevel: store.deleteImpactLevel,
      onDeleteImpactCategory: store.deleteImpactCategory,
      onInvertMatrixChange: store.setMatrixInverted,
      onImpactAggregationChange: store.setImpactAggregation,
      onEditLikelihoodLevel: (level) =>
        store.setEditingLevel({ type: 'likelihood', level }),
      onEditImpactLevel: (level) =>
        store.setEditingLevel({ type: 'impact', level }),
      onEditImpactCategory: store.setEditingImpactCategory,
      onEditMatrixCell: store.setEditingMatrixCell,
    };

    return {
      // Query state
      isLoading: loading,
      id: store.current?.id ?? null,
      originalTimestamp: store.current?.originalTimestamp ?? null,
      refetch,

      // Derived flags
      areSettingsComplete,
      requiresNewVersion,

      // Settings state & actions
      state,
      actions,

      // Editing dialogs
      editingLevel: store.editingLevel,
      editingImpactCategory: store.editingImpactCategory,
      editingMatrixCell: store.editingMatrixCell,
      setEditingLevel: store.setEditingLevel,
      setEditingImpactCategory: store.setEditingImpactCategory,
      setEditingMatrixCell: store.setEditingMatrixCell,
      confirmEditLevel: store.confirmEditLevel,
      confirmEditImpactCategory: store.confirmEditImpactCategory,
      confirmEditMatrixCell: store.confirmEditMatrixCell,

      // Lifecycle
      resetToInitial: store.resetToInitial,
    };
  };
